import csv
import io
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import numpy as np

from app.clients.elexon_client import elexon_client
from app.analysis.vintage_engine import VintageEngine
from app.analysis.metrics_engine import MetricsEngine
from app.cache.file_cache import file_cache
from app.schemas.analytics import (
    AccuracyMetrics,
    ErrorHistogramBin,
    ExtremeForecastEvent,
    MatchedInterval,
    OverviewSummary,
    SettlementPeriodProfile,
)

logger = logging.getLogger(__name__)

class ForecastService:
    def __init__(self):
        self.client = elexon_client

    async def get_overview(self, month: str = "2026-01") -> OverviewSummary:
        actuals = await self.client.get_january_2026_actuals()
        forecasts = await self.client.get_january_2026_forecasts()

        # Match entire January 2026 under standard Day-Ahead 11:00 UTC auction cutoff
        matched = VintageEngine.match_intervals(
            actuals=actuals,
            forecasts=forecasts,
            start_date="2026-01-01",
            end_date="2026-01-31",
            cutoff_type="DA_1100",
        )

        metrics = MetricsEngine.calculate_metrics(matched)

        # Calculate totals
        valid_intervals = [i for i in matched if i.status == "MATCHED"]
        total_act_gwh = (
            sum(i.actualMW * 0.5 for i in valid_intervals) / 1000.0 if valid_intervals else 0.0
        )
        total_fct_gwh = (
            sum(i.forecastMW * 0.5 for i in valid_intervals) / 1000.0 if valid_intervals else 0.0
        )

        peak_actual = 0.0
        peak_ts = ""
        lowest_actual = float("inf")
        lowest_ts = ""

        for i in valid_intervals:
            if i.actualMW > peak_actual:
                peak_actual = i.actualMW
                peak_ts = i.startTime
            if i.actualMW < lowest_actual:
                lowest_actual = i.actualMW
                lowest_ts = i.startTime

        if lowest_actual == float("inf"):
            lowest_actual = 0.0

        cache_meta = file_cache.get_metadata("elexon_fuelhh_wind_january_2026") or {}

        return OverviewSummary(
            month=month,
            totalActualGenerationGWh=round(total_act_gwh, 2),
            totalForecastGenerationGWh=round(total_fct_gwh, 2),
            peakActualGenerationMW=round(peak_actual, 1),
            peakActualTimestamp=peak_ts,
            lowestActualGenerationMW=round(lowest_actual, 1),
            lowestActualTimestamp=lowest_ts,
            overallMAE=metrics.mae or 0.0,
            overallRMSE=metrics.rmse or 0.0,
            overallBias=metrics.meanSignedError or 0.0,
            overallWAPE=metrics.wape or 0.0,
            completenessPercent=metrics.completenessPercent,
            totalPeriodsEvaluated=len(valid_intervals),
            dataSource="Elexon BMRS (FUELHH [WIND] & WINDFOR streams)",
            provenance={
                "evaluationPeriod": "2026-01-01 to 2026-01-31",
                "decisionCutoffDefault": "Day-Ahead 11:00 UTC (EPEX Auction)",
                "cacheMetadata": cache_meta,
            },
        )

    async def get_forecast_intelligence(
        self,
        delivery_date: str,
        cutoff_type: str = "DA_1100",
        matching_mode: str = "hour_block",
        custom_cutoff_hour: Optional[int] = None,
        custom_cutoff_dt: Optional[str] = None,
        explicit_publish_time: Optional[str] = None,
    ) -> Dict[str, Any]:
        actuals = await self.client.get_january_2026_actuals()
        forecasts = await self.client.get_january_2026_forecasts()

        intervals = VintageEngine.match_intervals(
            actuals=actuals,
            forecasts=forecasts,
            start_date=delivery_date,
            end_date=delivery_date,
            cutoff_type=cutoff_type,
            matching_mode=matching_mode,
            custom_cutoff_hour=custom_cutoff_hour,
            custom_cutoff_dt=custom_cutoff_dt,
            explicit_publish_time=explicit_publish_time,
        )

        metrics = MetricsEngine.calculate_metrics(intervals)
        available_pubs = VintageEngine.get_available_publications(forecasts, delivery_date)

        return {
            "deliveryDate": delivery_date,
            "cutoffType": cutoff_type,
            "matchingMode": matching_mode,
            "explicitPublishTime": explicit_publish_time,
            "metrics": metrics,
            "intervals": intervals,
            "availablePublications": available_pubs,
        }

    async def get_accuracy_dashboard(
        self,
        start_date: str = "2026-01-01",
        end_date: str = "2026-01-31",
        cutoff_type: str = "DA_1100",
        matching_mode: str = "hour_block",
        custom_cutoff_hour: Optional[int] = None,
    ) -> Dict[str, Any]:
        actuals = await self.client.get_january_2026_actuals()
        forecasts = await self.client.get_january_2026_forecasts()

        intervals = VintageEngine.match_intervals(
            actuals=actuals,
            forecasts=forecasts,
            start_date=start_date,
            end_date=end_date,
            cutoff_type=cutoff_type,
            matching_mode=matching_mode,
            custom_cutoff_hour=custom_cutoff_hour,
        )

        metrics = MetricsEngine.calculate_metrics(intervals)
        period_profiles = MetricsEngine.calculate_period_profile(intervals)
        histogram_bins = MetricsEngine.calculate_error_histogram(intervals, num_bins=16)
        top_over, top_under = MetricsEngine.get_extreme_events(intervals, top_n=5)

        # Aggregate error by delivery date
        daily_map: Dict[str, List[MatchedInterval]] = {}
        for i in intervals:
            d = i.settlementDate or i.startTime[:10]
            if d not in daily_map:
                daily_map[d] = []
            daily_map[d].append(i)

        daily_stats = []
        for d in sorted(daily_map.keys()):
            d_intervals = daily_map[d]
            d_metrics = MetricsEngine.calculate_metrics(d_intervals)
            d_valid = [x for x in d_intervals if x.status == "MATCHED"]
            avg_act = float(np.mean([x.actualMW for x in d_valid])) if d_valid else 0.0
            avg_fct = float(np.mean([x.forecastMW for x in d_valid])) if d_valid else 0.0
            daily_stats.append({
                "date": d,
                "mae": d_metrics.mae or 0.0,
                "rmse": d_metrics.rmse or 0.0,
                "bias": d_metrics.meanSignedError or 0.0,
                "wape": d_metrics.wape or 0.0,
                "avgActualMW": round(avg_act, 1),
                "avgForecastMW": round(avg_fct, 1),
                "validCount": d_metrics.validMatchedCount,
            })

        return {
            "startDate": start_date,
            "endDate": end_date,
            "cutoffType": cutoff_type,
            "metrics": metrics,
            "periodProfiles": period_profiles,
            "histogramBins": histogram_bins,
            "topOverforecasts": top_over,
            "topUnderforecasts": top_under,
            "dailyStats": daily_stats,
        }

    async def get_publications(self, delivery_date: str) -> List[Dict[str, Any]]:
        forecasts = await self.client.get_january_2026_forecasts()
        return VintageEngine.get_available_publications(forecasts, delivery_date)

    async def get_data_quality(self, start_date: str = "2026-01-01", end_date: str = "2026-01-31") -> Dict[str, Any]:
        actuals = await self.client.get_january_2026_actuals()
        forecasts = await self.client.get_january_2026_forecasts()

        intervals = VintageEngine.match_intervals(
            actuals=actuals,
            forecasts=forecasts,
            start_date=start_date,
            end_date=end_date,
            cutoff_type="DA_1100",
        )

        matched_count = sum(1 for i in intervals if i.status == "MATCHED")
        missing_act = sum(1 for i in intervals if i.status == "MISSING_ACTUAL")
        missing_fct = sum(1 for i in intervals if i.status == "MISSING_FORECAST")
        missing_both = sum(1 for i in intervals if i.status == "MISSING_BOTH")

        # Group by date for daily coverage
        daily_coverage = {}
        for i in intervals:
            d = i.settlementDate or i.startTime[:10]
            if d not in daily_coverage:
                daily_coverage[d] = {"expected": 0, "matched": 0, "missingActual": 0, "missingForecast": 0}
            daily_coverage[d]["expected"] += 1
            if i.status == "MATCHED":
                daily_coverage[d]["matched"] += 1
            elif i.status == "MISSING_ACTUAL":
                daily_coverage[d]["missingActual"] += 1
            elif i.status == "MISSING_FORECAST":
                daily_coverage[d]["missingForecast"] += 1

        coverage_list = [
            {
                "date": d,
                "expected": v["expected"],
                "matched": v["matched"],
                "missingActual": v["missingActual"],
                "missingForecast": v["missingForecast"],
                "coveragePct": round((v["matched"] / v["expected"]) * 100, 1) if v["expected"] else 0,
            }
            for d, v in sorted(daily_coverage.items())
        ]

        cache_actuals = file_cache.get_metadata("elexon_fuelhh_wind_january_2026")
        cache_forecasts = file_cache.get_metadata("elexon_windfor_january_2026")

        return {
            "period": f"{start_date} to {end_date}",
            "totalExpectedIntervals": len(intervals),
            "matchedIntervals": matched_count,
            "missingActualCount": missing_act,
            "missingForecastCount": missing_fct,
            "missingBothCount": missing_both,
            "overallCompletenessPct": round((matched_count / len(intervals)) * 100, 2) if intervals else 0,
            "dailyCoverage": coverage_list,
            "cacheStatus": {
                "actuals": cache_actuals,
                "forecasts": cache_forecasts,
            },
        }

    async def generate_csv_export(
        self,
        start_date: str = "2026-01-01",
        end_date: str = "2026-01-31",
        cutoff_type: str = "DA_1100",
        custom_cutoff_hour: Optional[int] = None,
    ) -> str:
        actuals = await self.client.get_january_2026_actuals()
        forecasts = await self.client.get_january_2026_forecasts()

        intervals = VintageEngine.match_intervals(
            actuals=actuals,
            forecasts=forecasts,
            start_date=start_date,
            end_date=end_date,
            cutoff_type=cutoff_type,
            custom_cutoff_hour=custom_cutoff_hour,
        )

        output = io.StringIO()
        writer = csv.writer(output, lineterminator="\n")

        # Metadata comment headers
        writer.writerow(["# WindSignal - UK Wind Forecast Intelligence Export"])
        writer.writerow([f"# Period: {start_date} to {end_date}"])
        writer.writerow([f"# Decision Cutoff: {cutoff_type}"])
        writer.writerow([f"# Export Timestamp: {datetime.now(timezone.utc).isoformat()}"])
        writer.writerow(["# Source: Elexon BMRS FUELHH (fuelType=WIND) and WINDFOR streams"])
        writer.writerow([])

        # Table header
        headers = [
            "DeliveryStartTimeUTC",
            "SettlementDate",
            "SettlementPeriod",
            "ForecastPublishTimeUTC",
            "LeadTimeHours",
            "ActualGenerationMW",
            "ForecastGenerationMW",
            "SignedErrorMW",
            "AbsoluteErrorMW",
            "PercentageErrorPct",
            "Status",
        ]
        writer.writerow(headers)

        for i in intervals:
            writer.writerow([
                i.startTime,
                i.settlementDate or "",
                i.settlementPeriod if i.settlementPeriod is not None else "",
                i.publishTime or "",
                i.leadTimeHours if i.leadTimeHours is not None else "",
                i.actualMW if i.actualMW is not None else "",
                i.forecastMW if i.forecastMW is not None else "",
                i.signedErrorMW if i.signedErrorMW is not None else "",
                i.absoluteErrorMW if i.absoluteErrorMW is not None else "",
                i.percentageError if i.percentageError is not None else "",
                i.status,
            ])

        return output.getvalue()

forecast_service = ForecastService()
