import type {
  OverviewSummary,
  SystemStatus,
  MatchedInterval,
  AccuracyMetrics,
  SettlementPeriodProfile,
  ErrorHistogramBin,
  ExtremeForecastEvent,
  DailyStat,
  PublicationVintageSummary,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface ForecastIntelligenceResponse {
  deliveryDate: string;
  cutoffType: string;
  matchingMode: string;
  explicitPublishTime?: string | null;
  metrics: AccuracyMetrics;
  intervals: MatchedInterval[];
  availablePublications: PublicationVintageSummary[];
}

export interface AccuracyDashboardResponse {
  startDate: string;
  endDate: string;
  cutoffType: string;
  metrics: AccuracyMetrics;
  periodProfiles: SettlementPeriodProfile[];
  histogramBins: ErrorHistogramBin[];
  topOverforecasts: ExtremeForecastEvent[];
  topUnderforecasts: ExtremeForecastEvent[];
  dailyStats: DailyStat[];
}

export const api = {
  async getStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE_URL}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getOverview(month: string = '2026-01'): Promise<OverviewSummary> {
    const res = await fetch(`${API_BASE_URL}/overview?month=${encodeURIComponent(month)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getForecastIntelligence(params: {
    deliveryDate: string;
    cutoffType?: string;
    matchingMode?: string;
    customCutoffHour?: number;
    explicitPublishTime?: string;
  }): Promise<ForecastIntelligenceResponse> {
    const query = new URLSearchParams();
    query.set('delivery_date', params.deliveryDate);
    if (params.cutoffType) query.set('cutoff_type', params.cutoffType);
    if (params.matchingMode) query.set('matching_mode', params.matchingMode);
    if (params.customCutoffHour !== undefined) query.set('custom_cutoff_hour', params.customCutoffHour.toString());
    if (params.explicitPublishTime) query.set('explicit_publish_time', params.explicitPublishTime);

    const res = await fetch(`${API_BASE_URL}/forecast/selected?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getAccuracyDashboard(params: {
    dateFrom?: string;
    dateTo?: string;
    cutoffType?: string;
    matchingMode?: string;
    customCutoffHour?: number;
  }): Promise<AccuracyDashboardResponse> {
    const query = new URLSearchParams();
    query.set('date_from', params.dateFrom || '2026-01-01');
    query.set('date_to', params.dateTo || '2026-01-31');
    if (params.cutoffType) query.set('cutoff_type', params.cutoffType);
    if (params.matchingMode) query.set('matching_mode', params.matchingMode);
    if (params.customCutoffHour !== undefined) query.set('custom_cutoff_hour', params.customCutoffHour.toString());

    const res = await fetch(`${API_BASE_URL}/accuracy?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getPublications(deliveryDate: string): Promise<{
    deliveryDate: string;
    count: number;
    publications: PublicationVintageSummary[];
  }> {
    const res = await fetch(`${API_BASE_URL}/publications?delivery_date=${encodeURIComponent(deliveryDate)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getDataQuality(dateFrom: string = '2026-01-01', dateTo: string = '2026-01-31'): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/data-quality?date_from=${dateFrom}&date_to=${dateTo}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getExportCsvUrl(params: { dateFrom?: string; dateTo?: string; cutoffType?: string }): string {
    const query = new URLSearchParams();
    query.set('date_from', params.dateFrom || '2026-01-01');
    query.set('date_to', params.dateTo || '2026-01-31');
    query.set('cutoff_type', params.cutoffType || 'DA_1100');
    return `${API_BASE_URL}/export.csv?${query.toString()}`;
  },

  async refreshCache(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/cache/refresh`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
