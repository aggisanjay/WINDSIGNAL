from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MatchedInterval(BaseModel):
    startTime: str = Field(..., description="Delivery start timestamp (ISO-8601 UTC)")
    settlementDate: Optional[str] = None
    settlementPeriod: Optional[int] = None
    actualMW: Optional[float] = None
    forecastMW: Optional[float] = None
    publishTime: Optional[str] = None
    leadTimeHours: Optional[float] = None
    signedErrorMW: Optional[float] = None  # F - A
    absoluteErrorMW: Optional[float] = None  # |F - A|
    percentageError: Optional[float] = None  # (|F - A| / A) * 100
    status: str = Field(..., description="MATCHED, MISSING_ACTUAL, or MISSING_FORECAST")

class AccuracyMetrics(BaseModel):
    mae: Optional[float] = Field(None, description="Mean Absolute Error in MW")
    rmse: Optional[float] = Field(None, description="Root Mean Square Error in MW")
    meanSignedError: Optional[float] = Field(None, description="Mean Signed Error (Bias) in MW")
    medianAbsoluteError: Optional[float] = Field(None, description="Median Absolute Error in MW")
    maxAbsoluteError: Optional[float] = Field(None, description="Maximum Absolute Error in MW")
    wape: Optional[float] = Field(None, description="Weighted Absolute Percentage Error in %")
    mape: Optional[float] = Field(None, description="Mean Absolute Percentage Error in % (filtered A > 100MW)")
    validMatchedCount: int = 0
    missingActualCount: int = 0
    missingForecastCount: int = 0
    totalExpectedIntervals: int = 0
    completenessPercent: float = 0.0
    overforecastIntervalsCount: int = 0
    underforecastIntervalsCount: int = 0

class ErrorHistogramBin(BaseModel):
    binStart: float
    binEnd: float
    count: int
    label: str

class SettlementPeriodProfile(BaseModel):
    settlementPeriod: int
    timeLabel: str
    mae: float
    rmse: float
    bias: float
    avgActualMW: float
    avgForecastMW: float
    sampleCount: int

class ExtremeForecastEvent(BaseModel):
    startTime: str
    publishTime: Optional[str]
    settlementDate: Optional[str]
    settlementPeriod: Optional[int]
    forecastMW: float
    actualMW: float
    signedErrorMW: float
    absoluteErrorMW: float
    eventType: str  # OVERFORECAST or UNDERFORECAST

class PublicationVintageSummary(BaseModel):
    publishTime: str
    deliveryDate: str
    intervalCount: int
    minDeliveryStart: str
    maxDeliveryStart: str
    avgLeadTimeHours: float

class OverviewSummary(BaseModel):
    month: str
    totalActualGenerationGWh: float
    totalForecastGenerationGWh: float
    peakActualGenerationMW: float
    peakActualTimestamp: str
    lowestActualGenerationMW: float
    lowestActualTimestamp: str
    overallMAE: float
    overallRMSE: float
    overallBias: float
    overallWAPE: float
    completenessPercent: float
    totalPeriodsEvaluated: int
    dataSource: str
    provenance: Dict[str, Any]
