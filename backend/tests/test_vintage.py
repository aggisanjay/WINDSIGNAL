import pytest
from app.analysis.vintage_engine import VintageEngine

def test_decision_cutoff_enforcement():
    """
    Ensures that for a delivery interval on 2026-01-15, only forecasts published
    at or before the decision cutoff (e.g., Day-Ahead 11:00 UTC = 2026-01-14 11:00:00Z)
    are eligible. Forecasts published after 11:00 UTC MUST NOT be selected.
    """
    actuals = [
        {
            "startTime": "2026-01-15T14:00:00Z",
            "generation": 12000.0,
            "settlementDate": "2026-01-15",
            "settlementPeriod": 29,
        }
    ]

    # Two forecast publications for 2026-01-15 14:00:00Z:
    # 1. Published 2026-01-14 09:30:00Z (Eligible before 11:00 UTC cutoff) -> 11500 MW
    # 2. Published 2026-01-14 10:45:00Z (Eligible before 11:00 UTC cutoff, newer) -> 11800 MW
    # 3. Published 2026-01-14 14:00:00Z (Look-ahead violation! Published AFTER 11:00 UTC cutoff) -> 12000 MW
    # 4. Published 2026-01-15 12:00:00Z (Intraday look-ahead violation!) -> 12050 MW
    forecasts = [
        {"startTime": "2026-01-15T14:00:00Z", "publishTime": "2026-01-14T09:30:00Z", "generation": 11500.0},
        {"startTime": "2026-01-15T14:00:00Z", "publishTime": "2026-01-14T10:45:00Z", "generation": 11800.0},
        {"startTime": "2026-01-15T14:00:00Z", "publishTime": "2026-01-14T14:00:00Z", "generation": 12000.0},
        {"startTime": "2026-01-15T14:00:00Z", "publishTime": "2026-01-15T12:00:00Z", "generation": 12050.0},
    ]

    # Under DA_1100 cutoff:
    # Cutoff is 2026-01-14T11:00:00Z.
    # The newest eligible forecast is 2026-01-14T10:45:00Z (11800 MW).
    matched = VintageEngine.match_intervals(
        actuals=actuals,
        forecasts=forecasts,
        start_date="2026-01-15",
        end_date="2026-01-15",
        cutoff_type="DA_1100",
    )

    interval_1400 = next(i for i in matched if i.startTime == "2026-01-15T14:00:00Z")
    assert interval_1400.status == "MATCHED"
    assert interval_1400.forecastMW == 11800.0
    assert interval_1400.publishTime == "2026-01-14T10:45:00Z"
    assert interval_1400.actualMW == 12000.0
    assert interval_1400.signedErrorMW == -200.0  # 11800 - 12000

def test_missing_forecast_status():
    """If no forecast was published before the cutoff, status must be MISSING_FORECAST"""
    actuals = [
        {
            "startTime": "2026-01-15T14:00:00Z",
            "generation": 12000.0,
            "settlementDate": "2026-01-15",
            "settlementPeriod": 29,
        }
    ]
    # Forecast only published at 16:00 (after 11:00 cutoff)
    forecasts = [
        {"startTime": "2026-01-15T14:00:00Z", "publishTime": "2026-01-14T16:00:00Z", "generation": 11800.0},
    ]

    matched = VintageEngine.match_intervals(
        actuals=actuals,
        forecasts=forecasts,
        start_date="2026-01-15",
        end_date="2026-01-15",
        cutoff_type="DA_1100",
    )

    interval_1400 = next(i for i in matched if i.startTime == "2026-01-15T14:00:00Z")
    assert interval_1400.status == "MISSING_FORECAST"
    assert interval_1400.forecastMW is None
    assert interval_1400.actualMW == 12000.0
