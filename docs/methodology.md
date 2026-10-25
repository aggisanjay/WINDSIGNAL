# Methodology & Analytical Specifications — WindSignal

## 1. Overview & Objective
WindSignal provides quantitative decision support for day-ahead electricity procurement desks evaluating national UK wind forecasts.

The platform answers critical trading desk questions:
1. What wind generation was forecast for a specific delivery interval?
2. Which forecast publication vintage was actually available before market auction closure?
3. How did that forecast compare with outturn generation, and what was the signed error?
4. How large was the error in Megawatts (MW) and percentage terms?
5. Does forecast error exhibit time-of-day (diurnal) bias or lead-time sensitivity?

---

## 2. Dataset Definitions

### 2.1 Actual Wind Generation (`FUELHH` Stream)
- **Source:** Elexon BMRS API (`/datasets/FUELHH/stream`)
- **Filter:** `fuelType == "WIND"`
- **Interval:** Half-hourly settlement periods (1–48 per standard day, UTC).
- **Units:** Megawatts (MW) average power across the 30-minute settlement interval.

### 2.2 Forecast Wind Generation (`WINDFOR` Stream)
- **Source:** Elexon BMRS API (`/datasets/WINDFOR/stream`)
- **Fields:** `startTime` (delivery period start), `publishTime` (time published by National Grid ESO), `generation` (MW).
- **Preservation:** Forecast records with different `publishTime` values are preserved as distinct historical vintages.

---

## 3. Decision-Time Vintage Selection & Anti-Lookahead Logic

In wholesale power markets, day-ahead positions must be committed prior to market gate closure. A forecast published after gate closure cannot be used for the day-ahead auction.

### Selection Algorithm
For a delivery interval starting at $t_{\text{delivery}}$ on date $D$:
1. Compute the effective decision cutoff timestamp $t_{\text{cutoff}}$ based on the chosen market rule:
   - **EPEX Spot Day-Ahead Auction (Default):** $(D - 1\text{ day}) \text{ at 11:00:00 UTC}$.
   - **Day-Ahead Gate Closure:** $(D - 1\text{ day}) \text{ at 12:00:00 UTC}$.
   - **Afternoon Rebalancing:** $(D - 1\text{ day}) \text{ at 17:00:00 UTC}$.
   - **Delivery Day Midnight:** $D \text{ at 00:00:00 UTC}$.
2. Filter all available WINDFOR forecast records targeting $t_{\text{delivery}}$ where:
   $$\text{publishTime} \le t_{\text{cutoff}}$$
3. Select the newest eligible record:
   $$F_{\text{selected}} = \operatorname*{argmax}_{\text{publishTime} \le t_{\text{cutoff}}} \{ \text{publishTime} \}$$
4. If no forecast satisfies this condition, the interval is recorded as `MISSING_FORECAST` and excluded from accuracy metrics.

---

## 4. Error Metrics & Formulations

Given matched pairs of actual generation $A_i$ and selected forecast $F_i$ for intervals $i = 1, \dots, N$:

### 4.1 Signed Error (MW)
$$e_i = F_i - A_i$$
- **$e_i > 0$ (Overforecast):** Forecast exceeded actual generation. The utility expected more clean power than arrived; exposed to buying replacement deficit power at market balancing prices.
- **$e_i < 0$ (Underforecast):** Actual generation exceeded forecast. Surplus generation on system; risk of spill or curtailment.

### 4.2 Mean Absolute Error (MAE)
$$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |F_i - A_i|$$

### 4.3 Root Mean Square Error (RMSE)
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (F_i - A_i)^2}$$

### 4.4 Mean Signed Error / Bias (MW)
$$\text{Bias} = \frac{1}{N} \sum_{i=1}^N (F_i - A_i)$$

### 4.5 Weighted Absolute Percentage Error (WAPE)
$$\text{WAPE} = \frac{\sum_{i=1}^N |F_i - A_i|}{\sum_{i=1}^N A_i} \times 100\% \quad (\text{if } \sum A_i > 0)$$
If $\sum A_i = 0$, WAPE is returned as `null` / unavailable rather than infinity.

### 4.6 Safe Mean Absolute Percentage Error (Safe MAPE)
$$\text{MAPE} = \frac{1}{M} \sum_{i: A_i \ge 100\text{ MW}} \frac{|F_i - A_i|}{A_i} \times 100\%$$
*Policy:* Intervals where actual wind generation is below 100 MW are excluded from the percentage error average to prevent asymptotic distortion when dividing by near-zero generation.

---

## 5. Scope & Analytical Boundaries
- **Wind Scope Only:** Evaluates national wind actuals and national wind forecasts. Other fuel types (solar, nuclear, gas) are not included.
- **Demand Limitation:** Does not model consumer electricity demand or grid transmission losses.
- **Decision Support:** Does not execute automatic trades or calculate final settlement cash-out bills.
