import pytest
import math
from app.schemas.analytics import MatchedInterval
from app.analysis.metrics_engine import MetricsEngine

def test_hand_calculated_metrics():
    """
    Hand-calculated test case:
    Interval 1: Actual = 1000 MW, Forecast = 1200 MW -> error = +200, abs = 200
    Interval 2: Actual = 1500 MW, Forecast = 1300 MW -> error = -200, abs = 200
    Interval 3: Actual = 2000 MW, Forecast = 2100 MW -> error = +100, abs = 100
    Interval 4: Actual = 500 MW,  Forecast = 400 MW  -> error = -100, abs = 100

    Expected:
    MAE = (200 + 200 + 100 + 100) / 4 = 600 / 4 = 150.0 MW
    RMSE = sqrt((200^2 + (-200)^2 + 100^2 + (-100)^2) / 4)
         = sqrt((40000 + 40000 + 10000 + 10000) / 4)
         = sqrt(100000 / 4) = sqrt(25000) = 158.11388... -> 158.11 MW
    Mean Signed Error (Bias) = (200 - 200 + 100 - 100) / 4 = 0.0 MW
    Median Absolute Error = median([100, 100, 200, 200]) = 150.0 MW
    Max Absolute Error = 200.0 MW
    Total Actual = 1000 + 1500 + 2000 + 500 = 5000 MW
    Total Absolute Error = 600 MW
    WAPE = (600 / 5000) * 100 = 12.0%
    """
    intervals = [
        MatchedInterval(
            startTime="2026-01-01T00:00:00Z",
            settlementDate="2026-01-01",
            settlementPeriod=1,
            actualMW=1000.0,
            forecastMW=1200.0,
            signedErrorMW=200.0,
            absoluteErrorMW=200.0,
            status="MATCHED",
        ),
        MatchedInterval(
            startTime="2026-01-01T00:30:00Z",
            settlementDate="2026-01-01",
            settlementPeriod=2,
            actualMW=1500.0,
            forecastMW=1300.0,
            signedErrorMW=-200.0,
            absoluteErrorMW=200.0,
            status="MATCHED",
        ),
        MatchedInterval(
            startTime="2026-01-01T01:00:00Z",
            settlementDate="2026-01-01",
            settlementPeriod=3,
            actualMW=2000.0,
            forecastMW=2100.0,
            signedErrorMW=100.0,
            absoluteErrorMW=100.0,
            status="MATCHED",
        ),
        MatchedInterval(
            startTime="2026-01-01T01:30:00Z",
            settlementDate="2026-01-01",
            settlementPeriod=4,
            actualMW=500.0,
            forecastMW=400.0,
            signedErrorMW=-100.0,
            absoluteErrorMW=100.0,
            status="MATCHED",
        ),
    ]

    metrics = MetricsEngine.calculate_metrics(intervals)

    assert metrics.mae == 150.0
    assert metrics.rmse == 158.11
    assert metrics.meanSignedError == 0.0
    assert metrics.medianAbsoluteError == 150.0
    assert metrics.maxAbsoluteError == 200.0
    assert metrics.wape == 12.0
    assert metrics.validMatchedCount == 4
    assert metrics.completenessPercent == 100.0
    assert metrics.overforecastIntervalsCount == 2
    assert metrics.underforecastIntervalsCount == 2

def test_wape_zero_actual_handling():
    """WAPE should return None if total actuals is 0 (prevents divide by zero)"""
    intervals = [
        MatchedInterval(
            startTime="2026-01-01T00:00:00Z",
            actualMW=0.0,
            forecastMW=50.0,
            signedErrorMW=50.0,
            absoluteErrorMW=50.0,
            status="MATCHED",
        )
    ]
    metrics = MetricsEngine.calculate_metrics(intervals)
    assert metrics.wape is None
    assert metrics.mae == 50.0

def test_safe_mape_filters_small_actuals():
    """
    MAPE should filter out actuals < 100 MW to avoid explosive percentages when wind generation is near zero.
    """
    intervals = [
        # Near-zero generation: 2 MW actual with 50 MW forecast would be 2400% error!
        MatchedInterval(
            startTime="2026-01-01T00:00:00Z",
            actualMW=2.0,
            forecastMW=50.0,
            signedErrorMW=48.0,
            absoluteErrorMW=48.0,
            status="MATCHED",
        ),
        # Significant generation: 1000 MW actual, 1100 MW forecast -> 10% error
        MatchedInterval(
            startTime="2026-01-01T00:30:00Z",
            actualMW=1000.0,
            forecastMW=1100.0,
            signedErrorMW=100.0,
            absoluteErrorMW=100.0,
            status="MATCHED",
        ),
    ]
    metrics = MetricsEngine.calculate_metrics(intervals)
    # Only interval 2 (>= 100 MW) is included in MAPE
    assert metrics.mape == 10.0
