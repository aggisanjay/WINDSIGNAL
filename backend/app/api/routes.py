from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse

from app.clients.elexon_client import elexon_client
from app.services.forecast_service import forecast_service
from app.cache.file_cache import file_cache
from app.schemas.analytics import OverviewSummary

router = APIRouter()

@router.get("/health", summary="Basic service health check")
async def health_check():
    return {
        "status": "healthy",
        "service": "WindSignal API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
    }

@router.get("/status", summary="System status, upstream Elexon reachability, and cache diagnostics")
async def system_status():
    upstream_health = await elexon_client.check_health()
    cache_entries = file_cache.list_entries()
    
    return {
        "service": "WindSignal UK Wind Forecast Intelligence",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "backend": {
            "status": "online",
            "port": 8000,
        },
        "upstreamElexon": upstream_health.model_dump(),
        "cache": {
            "entryCount": len(cache_entries),
            "entries": cache_entries,
        },
        "evaluationTarget": {
            "month": "2026-01",
            "expectedSettlementPeriods": 1488,  # 31 days * 48 periods
            "scope": "National Wind Actuals (FUELHH WIND) and National Wind Forecasts (WINDFOR)",
        },
    }

@router.get("/overview", response_model=OverviewSummary, summary="High-level January 2026 summary metrics")
async def get_overview(month: str = Query(default="2026-01", regex="^2026-01$")):
    try:
        return await forecast_service.get_overview(month=month)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate overview: {str(e)}")

@router.get("/actuals", summary="Retrieve raw filtered FUELHH actual wind generation records")
async def get_actuals(
    date_from: str = Query(default="2026-01-01", regex="^2026-01-[0-3][0-9]$"),
    date_to: str = Query(default="2026-01-31", regex="^2026-01-[0-3][0-9]$"),
):
    try:
        all_actuals = await elexon_client.get_january_2026_actuals()
        # Filter to requested delivery range
        start_iso = f"{date_from}T00:00:00Z"
        end_iso = f"{date_to}T23:59:59Z"
        filtered = [a for a in all_actuals if start_iso <= a["startTime"] <= end_iso]
        return {
            "dateFrom": date_from,
            "dateTo": date_to,
            "fuelType": "WIND",
            "count": len(filtered),
            "records": filtered,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving actuals: {str(e)}")

@router.get("/forecasts", summary="Retrieve WINDFOR forecast publications")
async def get_forecasts(
    delivery_date: Optional[str] = Query(None, regex="^2026-01-[0-3][0-9]$"),
    publish_from: Optional[str] = None,
    publish_to: Optional[str] = None,
):
    try:
        all_forecasts = await elexon_client.get_january_2026_forecasts()
        filtered = all_forecasts
        if delivery_date:
            deliv_start = f"{delivery_date}T00:00:00Z"
            deliv_end = f"{delivery_date}T23:59:59Z"
            filtered = [f for f in filtered if deliv_start <= f["startTime"] <= deliv_end]
        if publish_from:
            filtered = [f for f in filtered if f["publishTime"] >= publish_from]
        if publish_to:
            filtered = [f for f in filtered if f["publishTime"] <= publish_to]
        return {
            "deliveryDate": delivery_date,
            "count": len(filtered),
            "records": filtered[:1000],  # Bound return volume
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving forecasts: {str(e)}")

@router.get("/forecast/selected", summary="Select time-travel-safe forecast vintage matched with actuals")
async def get_selected_forecast(
    delivery_date: str = Query(default="2026-01-15", regex="^2026-01-[0-3][0-9]$"),
    cutoff_type: str = Query(default="DA_1100", description="DA_1100, DA_1200, DA_1700, DA_0000, or CUSTOM_HOUR"),
    matching_mode: str = Query(default="hour_block", description="'hour_block' (industry standard) or 'exact'"),
    custom_cutoff_hour: Optional[int] = Query(None, ge=0, le=23),
    custom_cutoff_dt: Optional[str] = None,
    explicit_publish_time: Optional[str] = None,
):
    try:
        return await forecast_service.get_forecast_intelligence(
            delivery_date=delivery_date,
            cutoff_type=cutoff_type,
            matching_mode=matching_mode,
            custom_cutoff_hour=custom_cutoff_hour,
            custom_cutoff_dt=custom_cutoff_dt,
            explicit_publish_time=explicit_publish_time,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resolve forecast intelligence: {str(e)}")

@router.get("/accuracy", summary="Aggregate accuracy metrics and distribution analysis")
async def get_accuracy(
    date_from: str = Query(default="2026-01-01", regex="^2026-01-[0-3][0-9]$"),
    date_to: str = Query(default="2026-01-31", regex="^2026-01-[0-3][0-9]$"),
    cutoff_type: str = Query(default="DA_1100"),
    matching_mode: str = Query(default="hour_block"),
    custom_cutoff_hour: Optional[int] = Query(None, ge=0, le=23),
):
    try:
        return await forecast_service.get_accuracy_dashboard(
            start_date=date_from,
            end_date=date_to,
            cutoff_type=cutoff_type,
            matching_mode=matching_mode,
            custom_cutoff_hour=custom_cutoff_hour,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute accuracy: {str(e)}")

@router.get("/accuracy/by-period", summary="Accuracy by half-hourly settlement period (diurnal profile)")
async def get_accuracy_by_period(
    date_from: str = Query(default="2026-01-01", regex="^2026-01-[0-3][0-9]$"),
    date_to: str = Query(default="2026-01-31", regex="^2026-01-[0-3][0-9]$"),
    cutoff_type: str = Query(default="DA_1100"),
):
    try:
        res = await forecast_service.get_accuracy_dashboard(
            start_date=date_from, end_date=date_to, cutoff_type=cutoff_type
        )
        return {
            "period": f"{date_from} to {date_to}",
            "cutoffType": cutoff_type,
            "periodProfiles": res["periodProfiles"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute period accuracy: {str(e)}")

@router.get("/publications", summary="List distinct forecast publications for a delivery day")
async def get_publications(
    delivery_date: str = Query(default="2026-01-15", regex="^2026-01-[0-3][0-9]$"),
):
    try:
        pubs = await forecast_service.get_publications(delivery_date=delivery_date)
        return {
            "deliveryDate": delivery_date,
            "count": len(pubs),
            "publications": pubs,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch publications: {str(e)}")

@router.get("/data-quality", summary="Data completeness, coverage, and missing observation tracker")
async def get_data_quality(
    date_from: str = Query(default="2026-01-01", regex="^2026-01-[0-3][0-9]$"),
    date_to: str = Query(default="2026-01-31", regex="^2026-01-[0-3][0-9]$"),
):
    try:
        return await forecast_service.get_data_quality(start_date=date_from, end_date=date_to)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate data quality report: {str(e)}")

@router.get("/export.csv", summary="RFC-4180 CSV export of matched intervals and accuracy data")
async def export_csv(
    date_from: str = Query(default="2026-01-01", regex="^2026-01-[0-3][0-9]$"),
    date_to: str = Query(default="2026-01-31", regex="^2026-01-[0-3][0-9]$"),
    cutoff_type: str = Query(default="DA_1100"),
):
    try:
        csv_content = await forecast_service.generate_csv_export(
            start_date=date_from,
            end_date=date_to,
            cutoff_type=cutoff_type,
        )
        filename = f"windsignal_{date_from}_{date_to}_{cutoff_type}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate CSV export: {str(e)}")

@router.post("/cache/refresh", summary="Trigger manual cache reload from Elexon BMRS API")
async def refresh_cache():
    try:
        file_cache.clear()
        act = await elexon_client.get_january_2026_actuals(force_refresh=True)
        fct = await elexon_client.get_january_2026_forecasts(force_refresh=True)
        return {
            "status": "success",
            "message": "January 2026 datasets re-fetched and cached successfully",
            "actualsCount": len(act),
            "forecastsCount": len(fct),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache refresh failed: {str(e)}")
