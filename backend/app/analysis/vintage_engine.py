from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
from app.schemas.analytics import MatchedInterval

class VintageEngine:
    @staticmethod
    def parse_iso(dt_str: str) -> datetime:
        # Handles 2026-01-01T04:00:00Z or +00:00
        clean_str = dt_str.replace("Z", "+00:00")
        return datetime.fromisoformat(clean_str)

    @classmethod
    def resolve_cutoff_for_delivery_date(
        cls,
        delivery_date_str: str,
        cutoff_type: str = "DA_1100",  # DA_1100, DA_1200, DA_1700, DA_0000, or CUSTOM_HOUR
        custom_cutoff_hour: Optional[int] = None,
        custom_cutoff_dt: Optional[str] = None,
    ) -> datetime:
        """
        Determines the decision cutoff timestamp for a delivery date.
        Day-Ahead decision cutoffs occur on Day D-1.
        """
        if custom_cutoff_dt:
            return cls.parse_iso(custom_cutoff_dt)

        delivery_dt = datetime.strptime(delivery_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        prev_day = delivery_dt - timedelta(days=1)

        if cutoff_type == "DA_1100":
            # 11:00 UTC Day-Ahead (EPEX Spot UK Day-Ahead Auction)
            return prev_day.replace(hour=11, minute=0, second=0, microsecond=0)
        elif cutoff_type == "DA_1200":
            # 12:00 UTC Day-Ahead (Standard Day-Ahead Gate)
            return prev_day.replace(hour=12, minute=0, second=0, microsecond=0)
        elif cutoff_type == "DA_1700":
            # 17:00 UTC Day-Ahead (Post-auction procurement / rebalancing)
            return prev_day.replace(hour=17, minute=0, second=0, microsecond=0)
        elif cutoff_type == "DA_0000":
            # 00:00 UTC Delivery Day midnight start
            return delivery_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        elif cutoff_type == "CUSTOM_HOUR" and custom_cutoff_hour is not None:
            return prev_day.replace(hour=custom_cutoff_hour, minute=0, second=0, microsecond=0)
        else:
            return prev_day.replace(hour=11, minute=0, second=0, microsecond=0)

    @classmethod
    def match_intervals(
        cls,
        actuals: List[Dict[str, Any]],
        forecasts: List[Dict[str, Any]],
        start_date: str,
        end_date: str,
        cutoff_type: str = "DA_1100",
        matching_mode: str = "hour_block",  # 'hour_block' (industry standard) or 'exact'
        custom_cutoff_hour: Optional[int] = None,
        custom_cutoff_dt: Optional[str] = None,
        explicit_publish_time: Optional[str] = None,
    ) -> List[MatchedInterval]:
        """
        Produces matched intervals for half-hourly settlement periods.
        Strictly enforces publishTime <= cutoff to eliminate look-ahead bias.
        
        matching_mode:
          - 'hour_block': In Elexon WINDFOR, forecasts are published at hourly resolution
            (e.g. 14:00:00Z). In UK utility operations, the hourly forecast applies to both
            half-hourly settlement periods in that hour (14:00 and 14:30).
          - 'exact': Strictly requires an exact startTime match (24 matched intervals per day).
        """
        # Index actuals by startTime
        actual_map: Dict[str, Dict[str, Any]] = {a["startTime"]: a for a in actuals}

        # Group forecasts by startTime
        forecast_by_start: Dict[str, List[Dict[str, Any]]] = {}
        for f in forecasts:
            st = f["startTime"]
            if st not in forecast_by_start:
                forecast_by_start[st] = []
            forecast_by_start[st].append(f)

        # Generate expected 30-min intervals for the date range
        start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(tzinfo=timezone.utc) + timedelta(days=1)

        matched_intervals: List[MatchedInterval] = []
        cur_dt = start_dt

        while cur_dt < end_dt:
            st_iso = cur_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            delivery_date_str = cur_dt.strftime("%Y-%m-%d")

            # Determine decision cutoff for this delivery interval
            cutoff_dt = cls.resolve_cutoff_for_delivery_date(
                delivery_date_str=delivery_date_str,
                cutoff_type=cutoff_type,
                custom_cutoff_hour=custom_cutoff_hour,
                custom_cutoff_dt=custom_cutoff_dt,
            )

            actual_record = actual_map.get(st_iso)

            # Determine candidate forecasts for this interval
            candidate_forecasts = forecast_by_start.get(st_iso, [])
            if not candidate_forecasts and matching_mode == "hour_block" and cur_dt.minute == 30:
                # Fallback to the top-of-the-hour forecast if in hour_block mode
                hour_top_dt = cur_dt.replace(minute=0, second=0)
                hour_top_iso = hour_top_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                candidate_forecasts = forecast_by_start.get(hour_top_iso, [])

            selected_forecast = None
            if explicit_publish_time:
                # Mode: Explicit Vintage
                for f in candidate_forecasts:
                    if f.get("publishTime") == explicit_publish_time:
                        selected_forecast = f
                        break
            else:
                # Mode: Latest eligible publication before or at cutoff
                eligible_forecasts = [
                    f for f in candidate_forecasts
                    if cls.parse_iso(f["publishTime"]) <= cutoff_dt
                ]
                if eligible_forecasts:
                    # Pick newest publication
                    selected_forecast = max(
                        eligible_forecasts, key=lambda x: cls.parse_iso(x["publishTime"])
                    )

            # Build MatchedInterval
            act_mw = actual_record["generation"] if actual_record else None
            settlement_period = actual_record.get("settlementPeriod") if actual_record else None
            # If settlementPeriod missing from actuals, calculate default from time of day (1 to 48)
            if settlement_period is None:
                settlement_period = (cur_dt.hour * 2) + (1 if cur_dt.minute < 30 else 2)

            f_mw = selected_forecast["generation"] if selected_forecast else None
            pub_time = selected_forecast["publishTime"] if selected_forecast else None

            lead_hours = None
            if pub_time:
                lead_hours = round(
                    (cur_dt - cls.parse_iso(pub_time)).total_seconds() / 3600.0, 2
                )

            signed_err = None
            abs_err = None
            pct_err = None
            status = "MATCHED"

            if act_mw is not None and f_mw is not None:
                signed_err = round(f_mw - act_mw, 2)
                abs_err = round(abs(signed_err), 2)
                if act_mw > 0:
                    pct_err = round((abs_err / act_mw) * 100, 2)
                status = "MATCHED"
            elif act_mw is None and f_mw is not None:
                status = "MISSING_ACTUAL"
            elif act_mw is not None and f_mw is None:
                status = "MISSING_FORECAST"
            else:
                status = "MISSING_BOTH"

            matched_intervals.append(
                MatchedInterval(
                    startTime=st_iso,
                    settlementDate=delivery_date_str,
                    settlementPeriod=settlement_period,
                    actualMW=act_mw,
                    forecastMW=f_mw,
                    publishTime=pub_time,
                    leadTimeHours=lead_hours,
                    signedErrorMW=signed_err,
                    absoluteErrorMW=abs_err,
                    percentageError=pct_err,
                    status=status,
                )
            )

            cur_dt += timedelta(minutes=30)

        return matched_intervals

    @classmethod
    def get_available_publications(
        cls,
        forecasts: List[Dict[str, Any]],
        delivery_date: str,
    ) -> List[Dict[str, Any]]:
        """
        Lists all distinct forecast publications that contain predictions for a target delivery date.
        """
        deliv_start_iso = f"{delivery_date}T00:00:00Z"
        deliv_end_iso = f"{delivery_date}T23:30:00Z"

        # Filter forecasts whose target delivery startTime falls on this day
        relevant = [
            f for f in forecasts
            if deliv_start_iso <= f["startTime"] <= deliv_end_iso
        ]

        # Group by publishTime
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for r in relevant:
            pt = r["publishTime"]
            if pt not in grouped:
                grouped[pt] = []
            grouped[pt].append(r)

        result = []
        target_dt = datetime.strptime(delivery_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        for pt, items in sorted(grouped.items(), key=lambda x: x[0], reverse=True):
            pt_dt = cls.parse_iso(pt)
            avg_lead = round((target_dt - pt_dt).total_seconds() / 3600.0, 1)
            starts = [i["startTime"] for i in items]
            result.append({
                "publishTime": pt,
                "deliveryDate": delivery_date,
                "intervalCount": len(items),
                "minDeliveryStart": min(starts),
                "maxDeliveryStart": max(starts),
                "avgLeadTimeHours": avg_lead,
            })

        return result
