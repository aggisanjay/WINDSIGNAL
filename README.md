# WindSignal — UK Wind Forecast Intelligence

> **Production-Quality UK Wind Forecast Intelligence Platform for Day-Ahead Electricity Procurement Decision Support**  
> *See the forecast. Quantify the risk. Buy with confidence.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![Tests](https://img.shields.io/badge/Pytest-Passing%20(5%2F5)-success.svg)](backend/tests)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg?logo=docker&logoColor=white)](docker-compose.yml)
[![Elexon BMRS](https://img.shields.io/badge/Elexon%20BMRS-Live%20Stream-10B981.svg)](https://data.elexon.co.uk)

---

## 1. Executive Summary & Problem Context

In the UK wholesale power market, wind generation is the single largest determinant of day-ahead electricity prices, reserve requirements, and system imbalance cash-out risk. Before submitting forward orders in the daily power auction (EPEX Spot UK Day-Ahead at 11:00 UTC or Nord Pool Day-Ahead at 12:00 UTC), utility procurement desks and balance responsible parties (BRPs) face critical analytical questions:
1. **Expected Generation**: What wind power outturn is forecast across Great Britain for each half-hour delivery interval?
2. **Decision Cutoff Anti-Lookahead**: Which forecast vintage was actually in the trader's hands before gate closure, strictly avoiding lookahead bias?
3. **Quantified Error Metrics**: What is the historical magnitude of forecast error in Megawatts (MAE, RMSE) and percentage (WAPE, safe-MAPE)?
4. **Structural Bias**: Does the National Grid ESO forecast systematically over-predict (creating deficit penalties) or under-predict (creating spill risk)?
5. **Ramp Event Volatility**: How do meteorological forecast updates evolve during severe winter storm events?

**WindSignal** addresses these challenges by consuming real, historical Elexon Balancing Mechanism Reporting Service (**BMRS**) data for **January 2026** (1 January 2026 through 31 January 2026), filtering multi-vintage forecasts at exact decision cutoffs, computing audit-grade error loss functions, and presenting intelligence through a state-of-the-art interactive financial terminal.

---

## 2. System Architecture & Data Provenance

WindSignal implements a high-performance **hybrid streaming architecture**:

```
                  ┌─────────────────────────────────────────┐
                  │      Official Elexon BMRS API           │
                  │       https://data.elexon.co.uk         │
                  └────────────────────┬────────────────────┘
                                       │
                      HTTP Streams with Exponential Backoff
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       FastAPI Python Backend            │
                  │         (ElexonClient Service)          │
                  └────────────┬──────────────────┬─────────┘
                               │                  │
                Raw JSON Cache │                  │ Dynamic Cutoff &
                (Sub-10ms)     ▼                  │ Metric Algorithms
                  ┌──────────────────────┐        ▼
                  │  Local Disk Storage  │  ┌───────────────────────┐
                  │  (.cache/*.json)     │  │  Analysis Engine      │
                  └──────────────────────┘  │  - Argmax Cutoff      │
                                            │  - Loss Functions     │
                                            └───────────┬───────────┘
                                                        │
                                            REST JSON   │ Port 8000
                                                        ▼
                                            ┌───────────────────────┐
                                            │  React 19 + Vite UI   │
                                            │  (TanStack Query v5)  │
                                            └───────────────────────┘
```

### Data Pipeline Details
- **Actual Generation (`FUELHH`)**: Consumed from `/datasets/FUELHH/stream`, filtered strictly for `fuelType == "WIND"`. Unit: Megawatts (MW) average power per half-hour settlement period.
- **Forecast Vintages (`WINDFOR`)**: Consumed from `/datasets/WINDFOR/stream`. Preserves every published forecast issued by National Grid ESO with exact `publishTime` and target delivery `startTime`.
- **Audit-Grade Local Disk Cache**: Raw streams are cached atomically in `.cache/` (`elexon_fuelhh_wind_january_2026.json` and `elexon_windfor_january_2026.json`) to eliminate 15–30s stream delays, guarantee sub-10ms local response times, and prevent upstream HTTP 429 rate-limiting.
- **Live Upstream Telemetry**: The backend continuously probes the live Elexon BMRS endpoint, reporting round-trip latency (displayed in the navbar badge and System Health dashboard).
- **On-Demand Cache Refresh**: Calling `POST /api/cache/refresh` (or clicking **"Trigger Cache Sync"** in the UI) invalidates local cache files and streams fresh records from Elexon.

---

## 3. Mathematical Formulations & Anti-Lookahead Policy

### Anti-Lookahead Decision Windows
To reflect real trading desk conditions, forecasts are selected by finding the most recent vintage published on or before the trading cutoff:
$$\text{Selected Forecast}(t_{\text{delivery}}, t_{\text{cutoff}}) = \arg\max_{t_{\text{pub}} \le t_{\text{cutoff}}} \{ F(t_{\text{pub}}, t_{\text{delivery}}) \}$$

Supported decision cutoffs:
- **Day-Ahead 11:00 UTC (Default)**: Aligns with EPEX Spot UK hourly auction order book closure.
- **Day-Ahead 12:00 UTC**: Aligns with Nord Pool / EPEX half-hourly auction gate closure.
- **Day-Ahead 17:00 UTC**: Afternoon rebalancing window.
- **Delivery Day 00:00 UTC**: Midnight prior to delivery.

### Metric Definitions
For matched intervals $i = 1, \dots, N$ with forecast $F_i$ and actual $A_i$:

1. **Signed Forecast Error (MW)**:
   $$e_i = F_i - A_i$$
   *(Positive = Overforecast / shortfall risk; Negative = Underforecast / spill risk)*
2. **Mean Absolute Error (MAE)**:
   $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |F_i - A_i|$$
3. **Root Mean Square Error (RMSE)**:
   $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (F_i - A_i)^2}$$
   *(Disproportionately penalizes extreme outlier blunders)*
4. **Mean Signed Bias (MW)**:
   $$\text{Bias} = \frac{1}{N} \sum_{i=1}^N (F_i - A_i)$$
5. **Weighted Absolute Percentage Error (WAPE)**:
   $$\text{WAPE} = \frac{\sum_{i=1}^N |F_i - A_i|}{\sum_{i=1}^N A_i} \times 100\% \quad (\text{if } \sum A_i > 0)$$
6. **Noise-Safe MAPE Thresholding**:
   $$\text{Safe MAPE} = \frac{1}{|S|} \sum_{i \in S} \frac{|F_i - A_i|}{A_i} \times 100\%, \quad S = \{i \mid A_i \ge 100 \text{ MW}\}$$
   *(Filters near-zero actuals to eliminate mathematical explosion)*

---

## 4. UI Architecture & Motion Design

WindSignal combines utility-grade financial density with editorial motion design:

### Permanent Deep Dark Navy Navigation
- Solid `#07172B` navbar background with `backdrop-filter: blur(16px)` and elevation shadow.
- Zero light bleeding from hero images; crisp solar amber CTA pill button and active indicator line.

### Interactive 3D Physics Hero Card
- Built with Framer Motion spring physics (`stiffness: 240`, `damping: 24`).
- Mouse cursor tracking maps continuous 3D rotation (`rotateX`, `rotateY`) with dynamic specular light sheen reflections.

### Directional Reveal System
Sections and cards reveal with coordinated, directional trajectories across all viewports (`viewport={{ once: true, amount: 0.1 }}`):
- **Hero Banner**: Left copy glides from the **LEFT** (`x: -100`); 3D card glides from the **RIGHT** (`x: 100`).
- **3 Floating Cards**: Card 1 from the **LEFT** (`x: -90`), Card 2 from the **MIDDLE** (`y: 75, scale: 0.9`), Card 3 from the **RIGHT** (`x: 90`).
- **Grid Decarbonisation**: Image from the **LEFT** (`x: -100`), story milestones from the **RIGHT** (`x: 100`).
- **Pipeline Cards (4 Steps)**: Sequential staggered reveals from left, center-left, center-right, and right.
- **Polar Ramp Case Study**: Historical story from the **LEFT** (`x: -100`), storm photo card from the **RIGHT** (`x: 100`).
- **Bottom 3 Pillars**: Pillar 1 from the **LEFT**, Pillar 2 from the **MIDDLE**, Pillar 3 from the **RIGHT**.

### Standardized 3-Tier Card Architecture
Every KPI and status card across all pages follows a structured visual hierarchy:
- **Row 1 (Header)**: Category label + 44px rounded Icon Badge (`.metric-icon-blue`, `.metric-icon-navy`, `.metric-icon-amber`, `.metric-icon-green`, `.metric-icon-red`).
- **Row 2 (Body)**: Display metric number (`2.3rem`, weight 800) + `.metric-unit` (`MW`, `GWh`, `%`).
- **Row 3 (Footer)**: Hairline divider, explanatory subtext, and status pill badge (`Baseline`, `Volatility`, `Shortfall`, `Surplus`, `Verified`, `Ground Truth`).
- **Persistent Top Accent Bars**: Colored 3px indicators (`.card-blue`, `.card-navy`, `.card-amber`, `.card-green`, `.card-red`).

---

## 5. Primary Application Views

| Route | View Name | Key Capabilities |
| :--- | :--- | :--- |
| `/` | **Overview** | Hero 3D interactive card, 3 floating segment cards, grid decarbonisation analysis, 4-step pipeline, January 2026 Polar Ramp case study, 3 value pillars. |
| `/forecast` | **Day-Ahead Forecast** | Interactive settlement date picker (Jan 1–31), cutoff selector, dual-series Recharts (Actual vs Forecast), 5 structured KPI cards, 48-interval breakdown table with CSV export. |
| `/accuracy` | **Accuracy & Risk** | 6 executive KPI cards, diurnal error profile across SP 1–48, signed error distribution histogram, 7-day rolling MAE trend, worst-day outlier ranking table. |
| `/publications` | **Vintage Curves** | Multi-vintage trajectory explorer. Compare two arbitrary publication horizons against actual outturn; full publication registry table. |
| `/methodology` | **Methodology** | Scientific transparency documentation, BMRS dataset specifications, anti-lookahead mathematical equations, operational limitations. |
| `/status` | **System Health** | Real-time FastAPI server telemetry, upstream Elexon BMRS endpoint connectivity and latency, cache file freshness, 1,488 SP data completeness audit. |

---

## 6. Repository Layout

```
windsignal/
├── backend/
│   ├── app/
│   │   ├── analysis/          # Vintage selection & metric calculation engines
│   │   ├── api/               # FastAPI REST endpoint routes
│   │   ├── cache/             # Atomic file cache manager
│   │   ├── clients/           # Elexon BMRS asynchronous streaming client
│   │   ├── schemas/           # Pydantic v2 domain schemas
│   │   ├── services/          # Forecast aggregation service
│   │   ├── config.py          # Environment settings
│   │   └── main.py            # FastAPI application entry point
│   ├── data_cache/            # Validated January 2026 Elexon cache (.json)
│   ├── tests/                 # Pytest test suite (hand-calculated test cases)
│   ├── Dockerfile             # Production backend container definition
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/images/         # Bespoke generated editorial energy photography
│   ├── src/
│   │   ├── components/        # Hero3DTiltCard, Navbar, Footer, layout
│   │   ├── pages/             # 6 primary analytical views
│   │   ├── services/          # Typed API client
│   │   ├── types/             # Domain TypeScript interfaces
│   │   ├── App.tsx            # Main router
│   │   ├── index.css          # Design tokens, typography, and card classes
│   │   └── main.tsx           # Mount point
│   ├── Dockerfile             # Multi-stage frontend container (Node + Nginx)
│   └── package.json           # Frontend dependencies
├── docs/
│   ├── architecture.md        # Technical architecture & deployment guide
│   ├── methodology.md         # Mathematical definitions & Elexon schemas
│   └── demo-script.md         # 5-minute utility client & technical lead walkthrough
├── docker-compose.yml         # Multi-container orchestration
├── .env.example               # Environment variables template
└── README.md                  # Master documentation
```

---

## 7. Local Quickstart

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- (Optional) Docker & Docker Compose

### Option A: Running with Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/windsignal.git
cd windsignal

# Build and start both containers
docker compose up --build
```
- **Frontend UI**: `http://localhost:3000` (or `http://localhost:80`)
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### Option B: Running Locally Without Docker

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated unit tests
python -m pytest tests/ -v

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Verify TypeScript compilation & bundle build
npm run build

# Start Vite dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 8. Automated Verification & Testing

Execute the backend pytest suite to verify calculation accuracy against hand-calculated reference values:
```bash
cd backend
python -m pytest tests/ -v
```

Test coverage includes:
- **`tests/test_metrics.py`**: Validates MAE, RMSE, signed bias, volume-weighted WAPE, safe-MAPE cutoff filtering ($A_i \ge 100$), and percentage calculations.
- **`tests/test_vintage.py`**: Validates anti-lookahead vintage selection, filtering by auction cutoffs (11:00 UTC, 12:00 UTC), and handling of missing observations.

---

## 9. Production Deployment

- **Frontend**: Deployable to **Vercel**, **Cloudflare Pages**, or **Netlify**. Set environment variable `VITE_API_BASE_URL` to point to the production backend URL.
- **Backend**: Containerized and deployable to **AWS ECS**, **GCP Cloud Run**, **Render**, or **Railway**. Configure `CORS_ORIGINS` to permit only the production frontend domain.

---

## 10. Known Analytical Scope & Boundaries

- **National Wind Generation Only**: Evaluates national wind actuals (`FUELHH WIND`) and forecasts (`WINDFOR`). Solar, gas CCGT, nuclear, and hydro generation are excluded from the error calculations.
- **No Consumer Demand Data**: Forecast error reflects wind supply deviation only, not total system net demand or retail customer load.
- **Decision Support Tool**: WindSignal provides quantitative risk analytics for trading desks; it does not execute automated trades or submit market auction bids.

---

## 11. AI Tool Disclosure

In accordance with technical assessment guidelines: AI assistance (Google DeepMind Gemini / Advanced Agentic Coding) was utilized during the architecture planning, code scaffolding, and documentation synthesis of this platform. All mathematical algorithms, Elexon API streaming clients, TypeScript types, and styling implementations were verified, compiled, and executed.
