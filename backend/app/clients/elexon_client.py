import asyncio
import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import httpx

from app.config import settings
from app.cache.file_cache import file_cache
from app.schemas.elexon import UpstreamHealth

logger = logging.getLogger(__name__)

class ElexonClient:
    def __init__(self, base_url: Optional[str] = None, timeout: Optional[float] = None):
        self.base_url = (base_url or settings.ELEXON_BASE_URL).rstrip("/")
        self.timeout = timeout or settings.REQUEST_TIMEOUT
        self.max_retries = settings.MAX_RETRIES

    async def _get_with_retry(self, url: str, params: Dict[str, str]) -> List[Dict[str, Any]]:
        last_exception = None
        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.get(url, params=params, headers={"Accept": "application/json"})
                    if resp.status_code == 200:
                        return resp.json()
                    elif resp.status_code in (429, 500, 502, 503, 504):
                        logger.warning(
                            f"Elexon API returned {resp.status_code} for {url}. Attempt {attempt}/{self.max_retries}"
                        )
                    else:
                        resp.raise_for_status()
            except (httpx.RequestError, httpx.HTTPStatusError) as e:
                last_exception = e
                logger.warning(f"Request failed (attempt {attempt}/{self.max_retries}): {e}")

            if attempt < self.max_retries:
                await asyncio.sleep(1.0 * (2 ** (attempt - 1)))

        logger.error(f"Elexon API failed after {self.max_retries} attempts: {last_exception}")
        raise RuntimeError(f"Upstream Elexon API error: {last_exception}")

    async def check_health(self) -> UpstreamHealth:
        url = f"{self.base_url}/datasets/FUELHH/stream"
        start_time = time.time()
        # Ping with narrow window
        params = {
            "publishDateTimeFrom": "2026-01-01T00:00:00Z",
            "publishDateTimeTo": "2026-01-01T00:30:00Z",
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, params=params, headers={"Accept": "application/json"})
                latency_ms = round((time.time() - start_time) * 1000, 1)
                reachable = resp.status_code == 200
                return UpstreamHealth(
                    reachable=reachable,
                    status_code=resp.status_code,
                    latency_ms=latency_ms,
                    endpoint=url,
                    message="Elexon BMRS API online and responding" if reachable else f"Upstream HTTP {resp.status_code}",
                )
        except Exception as e:
            latency_ms = round((time.time() - start_time) * 1000, 1)
            return UpstreamHealth(
                reachable=False,
                status_code=None,
                latency_ms=latency_ms,
                endpoint=url,
                message=f"Failed to connect: {str(e)}",
            )

    async def fetch_fuelhh_actuals_chunk(self, date_from_iso: str, date_to_iso: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/datasets/FUELHH/stream"
        params = {
            "publishDateTimeFrom": date_from_iso,
            "publishDateTimeTo": date_to_iso,
        }
        raw_items = await self._get_with_retry(url, params)
        # Filter fuelType = WIND
        wind_items = [
            item for item in raw_items
            if item.get("fuelType") == "WIND" and item.get("generation") is not None
        ]
        return wind_items

    async def fetch_windfor_forecasts_chunk(self, date_from_iso: str, date_to_iso: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/datasets/WINDFOR/stream"
        params = {
            "publishDateTimeFrom": date_from_iso,
            "publishDateTimeTo": date_to_iso,
        }
        raw_items = await self._get_with_retry(url, params)
        valid_items = [
            item for item in raw_items
            if item.get("generation") is not None and item.get("startTime") and item.get("publishTime")
        ]
        return valid_items

    async def get_january_2026_actuals(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        cache_key = "elexon_fuelhh_wind_january_2026"
        if not force_refresh:
            cached = file_cache.get(cache_key)
            if cached:
                logger.info("Serving January 2026 FUELHH actuals from cache")
                return cached

        # Fetch in 5-day windows to prevent stream timeouts
        start_dt = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
        end_dt = datetime(2026, 2, 1, 6, 0, tzinfo=timezone.utc)  # pad to Feb 1st 6am to capture late settlement publications
        chunk_days = 5

        all_records = []
        cur = start_dt
        while cur < end_dt:
            nxt = min(cur + timedelta(days=chunk_days), end_dt)
            logger.info(f"Fetching FUELHH chunk {cur.isoformat()} -> {nxt.isoformat()}")
            chunk_data = await self.fetch_fuelhh_actuals_chunk(cur.isoformat(), nxt.isoformat())
            all_records.extend(chunk_data)
            cur = nxt

        # Deduplicate deterministically by startTime (take latest publishTime if duplicate)
        seen: Dict[str, Dict[str, Any]] = {}
        for r in all_records:
            st = r["startTime"]
            if st not in seen or (r.get("publishTime") or "") > (seen[st].get("publishTime") or ""):
                seen[st] = r

        deduped = sorted(seen.values(), key=lambda x: x["startTime"])
        file_cache.set(cache_key, deduped)
        return deduped

    async def get_january_2026_forecasts(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        cache_key = "elexon_windfor_january_2026"
        if not force_refresh:
            cached = file_cache.get(cache_key)
            if cached:
                logger.info("Serving January 2026 WINDFOR forecasts from cache")
                return cached

        # WINDFOR needs publications starting from 2025-12-30 through 2026-02-01
        start_dt = datetime(2025, 12, 30, 0, 0, tzinfo=timezone.utc)
        end_dt = datetime(2026, 2, 1, 0, 0, tzinfo=timezone.utc)
        chunk_days = 4

        all_records = []
        cur = start_dt
        while cur < end_dt:
            nxt = min(cur + timedelta(days=chunk_days), end_dt)
            logger.info(f"Fetching WINDFOR chunk {cur.isoformat()} -> {nxt.isoformat()}")
            chunk_data = await self.fetch_windfor_forecasts_chunk(cur.isoformat(), nxt.isoformat())
            all_records.extend(chunk_data)
            cur = nxt

        # Deduplicate by (publishTime, startTime)
        seen: Dict[str, Dict[str, Any]] = {}
        for r in all_records:
            key = f"{r['publishTime']}|{r['startTime']}"
            seen[key] = r

        deduped = sorted(seen.values(), key=lambda x: (x["startTime"], x["publishTime"]))
        file_cache.set(cache_key, deduped)
        return deduped

elexon_client = ElexonClient()
