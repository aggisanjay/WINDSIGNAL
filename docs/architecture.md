# Architecture Documentation — WindSignal

## 1. System Overview
**WindSignal** is a decoupled full-stack intelligence application engineered to evaluate national UK wind forecasts against actual outturn generation for day-ahead power procurement teams.

The system connects to the official **Elexon BMRS Open API v1**, consumes the `FUELHH` and `WINDFOR` data streams for January 2026, and applies an anti-lookahead historical vintage selection algorithm to evaluate forecast accuracy.

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------+
|                  Elexon BMRS Open API v1                  |
|  - FUELHH Stream (Actual generation, filter: fuelType=WIND)|
|  - WINDFOR Stream (Forecast generation vintages)          |
+-----------------------------+-----------------------------+
                              |
                              v  (Async HTTPS with backoff)
+-----------------------------------------------------------+
|                    FastAPI Backend (8000)                 |
|                                                           |
|  [Clients]   ElexonClient (httpx, retries, chunking)      |
|  [Cache]     FileCache (Atomic JSON persistence, TTL)     |
|  [Engine]    VintageEngine (Time-travel-safe cutoff logic)|
|  [Metrics]   MetricsEngine (MAE, RMSE, Bias, WAPE, MAPE)  |
|  [Routers]   REST Endpoints (/api/forecast, /api/accuracy)|
+-----------------------------+-----------------------------+
                              |
                              v  (REST JSON / RFC-4180 CSV)
+-----------------------------------------------------------+
|                  React 19 Frontend (5173 / 80)            |
|                                                           |
|  [State]     TanStack Query (Cache, deduplication, retry) |
|  [Theme]     Design System (Midnight Navy #07172B tokens) |
|  [Visuals]   Recharts (Dual-series, diurnal profile bars) |
|  [Views]     Overview, Forecast, Accuracy, Publications,  |
|              Methodology, System Status                   |
+-----------------------------------------------------------+
```

---

## 3. Component Breakdown

### 3.1 Backend (`/backend`)
- **`app/clients/elexon_client.py`**:
  - Implements bounded chunking (5-day batches) over Elexon's streaming endpoints to eliminate HTTP timeout risks.
  - Exponential backoff retry logic (3 attempts: 1s, 2s, 4s delay).
  - Health check probe with live latency calculation.
- **`app/cache/file_cache.py`**:
  - Thread-safe, atomic disk caching (`.tmp` -> replace pattern).
  - Exposes entry metadata (size, age, modified timestamp) to `/api/status`.
- **`app/analysis/vintage_engine.py`**:
  - Strictly prevents look-ahead bias: for any target delivery interval, only publications with $\text{publishTime} \le \text{cutoff}$ are eligible.
  - Supports Day-Ahead auction cutoffs (11:00 UTC EPEX, 12:00 UTC Gate Closure, 17:00 UTC post-auction) and explicit vintage selection.
- **`app/analysis/metrics_engine.py`**:
  - Calculates MAE, RMSE, Bias, Median Error, Max Error, WAPE, and safe MAPE.
  - Generates diurnal settlement period profiles (SP 1–48) and histogram frequency bins.
- **`app/api/routes.py`**:
  - Documented FastAPI endpoints with Pydantic request/response validation.

### 3.2 Frontend (`/frontend`)
- **React 19 + TypeScript**: Type-safe development with strict verbatim module syntax.
- **TanStack Query**: Declarative server-state caching with background refetching for live status indicators.
- **Recharts**: High-density interactive charts with custom dark tooltip styling and explicit unit labeling (MW).
- **Design Tokens**: Space Grotesk (display), Inter (data/metrics), and JetBrains Mono (timestamps).

---

## 4. Security & Reliability
1. **Zero Secrets in Git**: The Elexon BMRS open API requires no secret credentials, but all endpoints and ports are environment-variable driven.
2. **CORS Governance**: Configured strictly through environment variables.
3. **No Fallback Mocking**: When external endpoints or records are missing, the UI presents honest empty/missing states, never synthetic or interpolated data.
