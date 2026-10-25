export interface MatchedInterval {
  startTime: string;
  settlementDate?: string;
  settlementPeriod?: number;
  actualMW?: number | null;
  forecastMW?: number | null;
  publishTime?: string | null;
  leadTimeHours?: number | null;
  signedErrorMW?: number | null;
  absoluteErrorMW?: number | null;
  percentageError?: number | null;
  status: 'MATCHED' | 'MISSING_ACTUAL' | 'MISSING_FORECAST' | 'MISSING_BOTH';
}

export interface AccuracyMetrics {
  mae?: number | null;
  rmse?: number | null;
  meanSignedError?: number | null;
  medianAbsoluteError?: number | null;
  maxAbsoluteError?: number | null;
  wape?: number | null;
  mape?: number | null;
  validMatchedCount: number;
  missingActualCount: number;
  missingForecastCount: number;
  totalExpectedIntervals: number;
  completenessPercent: number;
  overforecastIntervalsCount: number;
  underforecastIntervalsCount: number;
}

export interface SettlementPeriodProfile {
  settlementPeriod: number;
  timeLabel: string;
  mae: number;
  rmse: number;
  bias: number;
  avgActualMW: number;
  avgForecastMW: number;
  sampleCount: number;
}

export interface ErrorHistogramBin {
  binStart: number;
  binEnd: number;
  count: number;
  label: string;
}

export interface ExtremeForecastEvent {
  startTime: string;
  publishTime?: string;
  settlementDate?: string;
  settlementPeriod?: number;
  forecastMW: number;
  actualMW: number;
  signedErrorMW: number;
  absoluteErrorMW: number;
  eventType: 'OVERFORECAST' | 'UNDERFORECAST';
}

export interface DailyStat {
  date: string;
  mae: number;
  rmse: number;
  bias: number;
  wape: number;
  avgActualMW: number;
  avgForecastMW: number;
  validCount: number;
}

export interface PublicationVintageSummary {
  publishTime: string;
  deliveryDate: string;
  intervalCount: number;
  minDeliveryStart: string;
  maxDeliveryStart: string;
  avgLeadTimeHours: number;
}

export interface OverviewSummary {
  month: string;
  totalActualGenerationGWh: number;
  totalForecastGenerationGWh: number;
  peakActualGenerationMW: number;
  peakActualTimestamp: string;
  lowestActualGenerationMW: number;
  lowestActualTimestamp: string;
  overallMAE: number;
  overallRMSE: number;
  overallBias: number;
  overallWAPE: number;
  completenessPercent: number;
  totalPeriodsEvaluated: number;
  dataSource: string;
  provenance: {
    evaluationPeriod: string;
    decisionCutoffDefault: string;
    cacheMetadata: any;
  };
}

export interface SystemStatus {
  service: string;
  timestamp: string;
  backend: {
    status: string;
    port: number;
  };
  upstreamElexon: {
    reachable: boolean;
    status_code?: number;
    latency_ms?: number;
    endpoint: string;
    message: string;
  };
  cache: {
    entryCount: number;
    entries: Array<{
      key: string;
      size_bytes: number;
      last_modified: string;
      age_minutes: number;
    }>;
  };
  evaluationTarget: {
    month: string;
    expectedSettlementPeriods: number;
    scope: string;
  };
}
