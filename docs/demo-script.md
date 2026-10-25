# WindSignal Demo Scripts

This document outlines the two structured five-minute walkthrough presentations:
1. **Client Demo (0:00–5:00)**: Focused on utility power procurement, risk quantification, and day-ahead decision support.
2. **Technical Review (5:00–10:00)**: Focused on architecture, Elexon API streaming, anti-lookahead vintage selection, calculation correctness, and testing.

---

## Part 1: Utility Client Demo (5 Minutes)

### 0:00–0:30 — Introduce the Business Problem
- **Narrative:** "Good morning. In the UK wholesale electricity market, power procurement analysts face a major financial risk: renewable wind generation fluctuates rapidly with Atlantic weather fronts. Before committing day-ahead buy orders at auction gates, procurement desks need to know how reliable wind forecasts have been, what error margin to budget for, and whether models systematically over- or under-predict."
- **Visual:** Navigate to the WindSignal landing page (`/`). Point out the editorial hero: *"Forecast the wind. Understand the risk."* and highlight the live status indicator showing active connection to Elexon BMRS.

### 0:30–1:15 — The January 2026 Dataset & Overview
- **Narrative:** "Here in our Overview dashboard, we have ingested the complete historical outturn for January 2026 directly from Elexon's open BMRS streams. During January 2026, UK wind generated over 4,300 GWh of clean energy, peaking at 17,805 MW. But across the entire month, the day-ahead forecast Mean Absolute Error was approximately 2,100 MW with an 18.2% WAPE. That represents massive volume uncertainty for procurement teams."
- **Visual:** Scroll through the live KPI ticker and the three core value cards: *Forecast Visibility*, *Anti-Lookahead Engine*, and *Procurement Context*.

### 1:15–2:30 — Forecast Intelligence Workspace & Vintages
- **Narrative:** "Let's open the Forecast Intelligence workspace (`/forecast`). Here, an analyst can select any delivery date in January 2026. For example, let's examine January 15th, 2026. Crucially, we enforce a strict Decision Cutoff — for example, Day-Ahead 11:00 UTC, which corresponds to the EPEX Spot auction closure. Notice how our platform strictly hides any forecast published after that cutoff, eliminating look-ahead bias."
- **Visual:** Select `2026-01-15`. Show the Cutoff dropdown switching between `DA_1100` and `DA_1700`. Show how the selected forecast curve responds.

### 2:30–3:45 — Compare Forecast Against Actual Outturn
- **Narrative:** "On the dual-series chart, the dark navy line displays the observed actual wind generation from the FUELHH stream, while the cyan line displays the selected Day-Ahead WINDFOR forecast. Notice in the morning hours between SP 10 and 20, the forecast was tracking above actual generation — this is an overforecast. The utility expected more clean power than arrived and would have had to purchase deficit balancing power."
- **Visual:** Hover over the chart tooltips showing actual MW, forecast MW, signed error, and settlement period. Scroll down to the half-hourly breakdown table.

### 3:45–4:30 — Explain MAE, RMSE, and Error Distribution
- **Narrative:** "Navigating to Accuracy Analysis (`/accuracy`), we see the full statistical risk distribution across January 2026. Beyond MAE, we report RMSE to penalize large forecast blunders, and Mean Signed Bias. Looking at the diurnal time-of-day profile, we can see how forecast errors peak during morning ramp periods. The error histogram and extreme event tables reveal the top 5 largest overforecast and underforecast events of the month."
- **Visual:** Show diurnal settlement period bar chart, daily MAE trendline, and the extreme events table.

### 4:30–5:00 — Business Value, Boundaries & Next Steps
- **Narrative:** "In summary, WindSignal gives procurement desks the clarity to buy power smarter, hedge imbalance exposure, and audit forecast performance. As an explicit boundary: this tool evaluates wind forecast risk; it does not replace human market bidding or incorporate consumer demand. Thank you."

---

## Part 2: Technical Review (5 Minutes)

### 0:00–0:45 — Architecture & Repository Layout
- **Narrative:** "Welcome to the technical review. WindSignal is architected as a decoupled, production-grade system with a Python FastAPI backend and a React 19 TypeScript frontend. The codebase strictly separates concerns: `app/clients` for external HTTP communication, `app/cache` for resilient disk caching, `app/analysis` for vintage selection and statistical metrics, and `app/api` for REST routing. In the frontend, we use TanStack Query for declarative server state and Recharts for responsive analytics."
- **Visual:** Display the directory tree and open `architecture.md`.

### 0:45–1:45 — Elexon Client & Data Ingestion
- **Narrative:** "We integrate directly with Elexon's open BMRS endpoints: `FUELHH` for actual generation filtered to `fuelType = WIND`, and `WINDFOR` for wind forecasts. Because streaming millions of raw JSON records can cause HTTP timeouts, our `ElexonClient` fetches data in bounded 5-day chunks with exponential backoff retries. Deduplication is deterministic by settlement timestamp. Cached files in `backend/data_cache` use atomic write-and-replace to guarantee file integrity."
- **Visual:** Open `app/clients/elexon_client.py` and inspect `fetch_fuelhh_actuals_chunk` and `get_january_2026_actuals`.

### 1:45–2:45 — Historical Vintage Selection & Cutoff Logic
- **Narrative:** "The most critical analytical component is `VintageEngine.match_intervals`. WINDFOR is a multi-vintage stream with multiple publication timestamps for each delivery interval. If a system selects a forecast published at 16:00 UTC for a day-ahead auction that closed at 11:00 UTC, it introduces catastrophic look-ahead bias. Our engine resolves the exact decision cutoff and selects only the latest forecast published at or before that cutoff. If no forecast is available, it is recorded as `MISSING_FORECAST` and never fabricated."
- **Visual:** Open `app/analysis/vintage_engine.py` and walk through the timestamp comparison logic.

### 2:45–3:45 — Error Metrics & Missing-Data Handling
- **Narrative:** "In `MetricsEngine`, all metrics are computed from verified matched pairs. We calculate signed error $F - A$, MAE, RMSE, Bias, and WAPE. Notice our zero-handling policy: if the denominator of WAPE is zero, it returns null instead of crashing with division by zero. Furthermore, for MAPE, we strictly filter out intervals where actual generation is below 100 MW, preventing asymptotic distortion when dividing by near-zero wind output."
- **Visual:** Open `app/analysis/metrics_engine.py` and inspect `calculate_metrics`.

### 3:45–4:30 — Automated Testing & Verification
- **Narrative:** "Our test suite in `backend/tests` uses pytest. `test_metrics.py` includes hand-calculated synthetic cases where every metric (MAE, RMSE, Bias, WAPE, MAPE) was verified by hand. `test_vintage.py` explicitly tests cutoff enforcement by passing forecast records published before, during, and after cutoff, ensuring post-cutoff forecasts are rejected."
- **Visual:** Run `python -m pytest tests/` in terminal showing 5 passed tests in 0.6s.

### 4:30–5:00 — Docker, Production Configuration & Next Steps
- **Narrative:** "For deployment, we provide production multi-stage Dockerfiles for both frontend (Node build + Nginx alpine) and backend (Python 3.11 slim with healthchecks), orchestrated via `docker-compose.yml`. The frontend compiles cleanly with TypeScript and Vite. All 9 editorial imagery assets are embedded. The product is complete, tested, and ready for deployment."
