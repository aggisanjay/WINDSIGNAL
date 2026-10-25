import math
from typing import Dict, List, Optional, Tuple
import numpy as np

from app.schemas.analytics import (
    AccuracyMetrics,
    ErrorHistogramBin,
    ExtremeForecastEvent,
    MatchedInterval,
    SettlementPeriodProfile,
)

class MetricsEngine:
    @staticmethod
    def calculate_metrics(intervals: List[MatchedInterval]) -> AccuracyMetrics:
        """
        Calculates MAE, RMSE, Bias, Median Error, Max Error, WAPE, and safe MAPE.
        Never silently replaces missing values with zero.
        """
        matched = [i for i in intervals if i.status == "MATCHED"]
        missing_actual = sum(1 for i in intervals if i.status == "MISSING_ACTUAL")
        missing_forecast = sum(1 for i in intervals if i.status == "MISSING_FORECAST")
        total_expected = len(intervals)

        completeness_pct = (
            round((len(matched) / total_expected) * 100, 2) if total_expected > 0 else 0.0
        )

        if not matched:
            return AccuracyMetrics(
                mae=None,
                rmse=None,
                meanSignedError=None,
                medianAbsoluteError=None,
                maxAbsoluteError=None,
                wape=None,
                mape=None,
                validMatchedCount=0,
                missingActualCount=missing_actual,
                missingForecastCount=missing_forecast,
                totalExpectedIntervals=total_expected,
                completenessPercent=completeness_pct,
                overforecastIntervalsCount=0,
                underforecastIntervalsCount=0,
            )

        actuals = np.array([i.actualMW for i in matched], dtype=float)
        forecasts = np.array([i.forecastMW for i in matched], dtype=float)

        errors = forecasts - actuals
        abs_errors = np.abs(errors)

        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        bias = float(np.mean(errors))
        median_abs = float(np.median(abs_errors))
        max_abs = float(np.max(abs_errors))

        # WAPE calculation: sum(|F - A|) / sum(A) * 100
        sum_actuals = float(np.sum(actuals))
        wape = None
        if sum_actuals > 0:
            wape = round((float(np.sum(abs_errors)) / sum_actuals) * 100, 2)

        # Safe MAPE calculation: only for observations with actuals >= 100 MW
        significant_mask = actuals >= 100.0
        mape = None
        if np.any(significant_mask):
            sig_pct = (abs_errors[significant_mask] / actuals[significant_mask]) * 100.0
            mape = round(float(np.mean(sig_pct)), 2)

        over_count = int(np.sum(errors > 0))
        under_count = int(np.sum(errors < 0))

        return AccuracyMetrics(
            mae=round(mae, 2),
            rmse=round(rmse, 2),
            meanSignedError=round(bias, 2),
            medianAbsoluteError=round(median_abs, 2),
            maxAbsoluteError=round(max_abs, 2),
            wape=wape,
            mape=mape,
            validMatchedCount=len(matched),
            missingActualCount=missing_actual,
            missingForecastCount=missing_forecast,
            totalExpectedIntervals=total_expected,
            completenessPercent=completeness_pct,
            overforecastIntervalsCount=over_count,
            underforecastIntervalsCount=under_count,
        )

    @staticmethod
    def calculate_period_profile(intervals: List[MatchedInterval]) -> List[SettlementPeriodProfile]:
        """
        Aggregates accuracy metrics by settlement period (1 to 48) to reveal diurnal error patterns.
        """
        matched = [i for i in intervals if i.status == "MATCHED" and i.settlementPeriod]
        grouped: Dict[int, List[MatchedInterval]] = {}
        for i in matched:
            sp = i.settlementPeriod
            if sp not in grouped:
                grouped[sp] = []
            grouped[sp].append(i)

        profiles: List[SettlementPeriodProfile] = []
        for sp in range(1, 49):
            group = grouped.get(sp, [])
            # Format time label, e.g. SP 1 is 00:00 - 00:30, SP 2 is 00:30 - 01:00
            start_hour = (sp - 1) // 2
            start_min = 0 if (sp % 2 == 1) else 30
            time_label = f"{start_hour:02d}:{start_min:02d}"

            if not group:
                profiles.append(
                    SettlementPeriodProfile(
                        settlementPeriod=sp,
                        timeLabel=time_label,
                        mae=0.0,
                        rmse=0.0,
                        bias=0.0,
                        avgActualMW=0.0,
                        avgForecastMW=0.0,
                        sampleCount=0,
                    )
                )
                continue

            acts = np.array([x.actualMW for x in group], dtype=float)
            fcts = np.array([x.forecastMW for x in group], dtype=float)
            errs = fcts - acts
            abs_errs = np.abs(errs)

            profiles.append(
                SettlementPeriodProfile(
                    settlementPeriod=sp,
                    timeLabel=time_label,
                    mae=round(float(np.mean(abs_errs)), 2),
                    rmse=round(float(np.sqrt(np.mean(errs ** 2))), 2),
                    bias=round(float(np.mean(errs)), 2),
                    avgActualMW=round(float(np.mean(acts)), 2),
                    avgForecastMW=round(float(np.mean(fcts)), 2),
                    sampleCount=len(group),
                )
            )

        return profiles

    @staticmethod
    def calculate_error_histogram(
        intervals: List[MatchedInterval], num_bins: int = 15
    ) -> List[ErrorHistogramBin]:
        """
        Builds discrete frequency bins for signed forecast errors (Forecast - Actual).
        """
        matched = [i for i in intervals if i.status == "MATCHED" and i.signedErrorMW is not None]
        if not matched:
            return []

        errors = np.array([i.signedErrorMW for i in matched], dtype=float)
        min_err = float(np.min(errors))
        max_err = float(np.max(errors))

        # Pad slightly
        padding = max(50.0, (max_err - min_err) * 0.05)
        bin_edges = np.linspace(min_err - padding, max_err + padding, num_bins + 1)

        counts, _ = np.histogram(errors, bins=bin_edges)

        bins: List[ErrorHistogramBin] = []
        for i in range(num_bins):
            start = float(bin_edges[i])
            end = float(bin_edges[i + 1])
            bins.append(
                ErrorHistogramBin(
                    binStart=round(start, 1),
                    binEnd=round(end, 1),
                    count=int(counts[i]),
                    label=f"{int(round(start))} to {int(round(end))} MW",
                )
            )

        return bins

    @staticmethod
    def get_extreme_events(
        intervals: List[MatchedInterval], top_n: int = 5
    ) -> Tuple[List[ExtremeForecastEvent], List[ExtremeForecastEvent]]:
        """
        Identifies the top N worst overforecasts (F >> A) and top N worst underforecasts (F << A).
        """
        matched = [i for i in intervals if i.status == "MATCHED" and i.signedErrorMW is not None]
        if not matched:
            return [], []

        # Sort descending by signed error -> highest overforecasts
        overforecasts = sorted(matched, key=lambda x: x.signedErrorMW, reverse=True)[:top_n]
        top_over = [
            ExtremeForecastEvent(
                startTime=i.startTime,
                publishTime=i.publishTime,
                settlementDate=i.settlementDate,
                settlementPeriod=i.settlementPeriod,
                forecastMW=i.forecastMW,
                actualMW=i.actualMW,
                signedErrorMW=i.signedErrorMW,
                absoluteErrorMW=i.absoluteErrorMW,
                eventType="OVERFORECAST",
            )
            for i in overforecasts
            if i.signedErrorMW > 0
        ]

        # Sort ascending by signed error -> worst underforecasts
        underforecasts = sorted(matched, key=lambda x: x.signedErrorMW)[:top_n]
        top_under = [
            ExtremeForecastEvent(
                startTime=i.startTime,
                publishTime=i.publishTime,
                settlementDate=i.settlementDate,
                settlementPeriod=i.settlementPeriod,
                forecastMW=i.forecastMW,
                actualMW=i.actualMW,
                signedErrorMW=i.signedErrorMW,
                absoluteErrorMW=i.absoluteErrorMW,
                eventType="UNDERFORECAST",
            )
            for i in underforecasts
            if i.signedErrorMW < 0
        ]

        return top_over, top_under
