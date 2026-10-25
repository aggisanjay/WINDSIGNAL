from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ActualRecord(BaseModel):
    startTime: str = Field(..., description="Delivery start timestamp in ISO-8601 UTC")
    generation: float = Field(..., description="Actual wind generation in MW")
    fuelType: str = Field(default="WIND", description="Fuel type filter, must be WIND")
    settlementDate: Optional[str] = Field(None, description="Settlement date (YYYY-MM-DD)")
    settlementPeriod: Optional[int] = Field(None, description="Half-hourly settlement period (1-48/50)")
    publishTime: Optional[str] = Field(None, description="Publication timestamp")

class ForecastRecord(BaseModel):
    startTime: str = Field(..., description="Target delivery start timestamp in ISO-8601 UTC")
    publishTime: str = Field(..., description="Forecast publication timestamp in ISO-8601 UTC")
    generation: float = Field(..., description="Forecast wind generation in MW")

class UpstreamHealth(BaseModel):
    reachable: bool
    status_code: Optional[int] = None
    latency_ms: Optional[float] = None
    endpoint: str
    message: str
