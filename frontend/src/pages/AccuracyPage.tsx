import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  Layers,
  TrendingDown,
  AlertCircle,
  CalendarRange,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export const AccuracyPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-01-31');
  const [cutoffType, setCutoffType] = useState('DA_1100');
  const [matchingMode, setMatchingMode] = useState('hour_block');

  const { data, isLoading } = useQuery({
    queryKey: ['accuracyDashboard', dateFrom, dateTo, cutoffType, matchingMode],
    queryFn: () =>
      api.getAccuracyDashboard({
        dateFrom,
        dateTo,
        cutoffType,
        matchingMode,
      }),
  });

  const metrics = data?.metrics;
  const periodProfiles = data?.periodProfiles || [];
  const histogramBins = data?.histogramBins || [];
  const topOver = data?.topOverforecasts || [];
  const topUnder = data?.topUnderforecasts || [];
  const dailyStats = data?.dailyStats || [];

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '96px' }}>
      
      {/* STRUCTURED PAGE HERO BANNER */}
      <section className="page-hero-banner">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-amber" style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
              QUANTITATIVE RISK AUDIT
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>•</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)' }}>
              JANUARY 2026 OUTTURN VS WINDFOR VINTAGES
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            Forecast Accuracy & Risk Distribution
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1rem', maxWidth: '720px', marginTop: '10px', lineHeight: 1.5 }}>
            Empirical statistical evaluation of National Grid ESO wind generation forecasts. Quantifies mean error, volatility penalty, diurnal ramp bias, and extreme imbalance tail risks.
          </p>
        </div>
      </section>

      {/* STRUCTURED CONTROLS TOOLBAR */}
      <section style={{ marginTop: '-24px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="filter-toolbar-pro">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
              
              {/* Date Range */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarRange size={16} color="var(--energy-blue)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Date Range:
                </span>
                <input
                  type="date"
                  min="2026-01-01"
                  max="2026-01-31"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="filter-input-pro"
                />
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>to</span>
                <input
                  type="date"
                  min="2026-01-01"
                  max="2026-01-31"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="filter-input-pro"
                />
              </div>

              {/* Cutoff Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--energy-blue)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Decision Cutoff:
                </span>
                <select
                  value={cutoffType}
                  onChange={(e) => setCutoffType(e.target.value)}
                  className="filter-input-pro"
                >
                  <option value="DA_1100">Day-Ahead 11:00 UTC (EPEX Auction)</option>
                  <option value="DA_1200">Day-Ahead 12:00 UTC (Gate Closure)</option>
                  <option value="DA_1700">Day-Ahead 17:00 UTC (Post-Auction)</option>
                  <option value="DA_0000">Delivery Day 00:00 UTC (Midnight)</option>
                </select>
              </div>

              {/* Resolution */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="var(--energy-blue)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Resolution:
                </span>
                <select
                  value={matchingMode}
                  onChange={(e) => setMatchingMode(e.target.value)}
                  className="filter-input-pro"
                >
                  <option value="hour_block">Hourly Block (48 SPs/day)</option>
                  <option value="exact">Exact Boundary (24 SPs/day)</option>
                </select>
              </div>

            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
              {isLoading ? 'Calculating metrics...' : `${metrics?.validMatchedCount || 0} valid periods evaluated`}
            </div>
          </div>
        </div>
      </section>

      {/* EXECUTIVE STATISTICAL KPI RIBBON */}
      <section style={{ padding: '8px 0 32px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '18px',
          }}>
            
            {/* MAE */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-blue"
            >
              <div className="metric-card-header">
                <span className="metric-card-label">Mean Absolute Error</span>
                <div className="metric-icon-badge metric-icon-blue">
                  <TrendingDown size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <div className="metric-card-value">
                  {metrics?.mae != null ? `${Math.round(metrics.mae).toLocaleString()}` : '—'}
                  <span className="metric-unit">MW</span>
                </div>
              </div>
              <div className="metric-card-sub">
                <span>Average absolute deviation</span>
                <span className="badge badge-blue">Baseline</span>
              </div>
            </motion.div>

            {/* RMSE: From LEFT-CENTER */}
            <motion.div
              initial={{ opacity: 0, y: 35, x: -25 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-navy"
            >
              <div className="metric-card-header">
                <span className="metric-card-label">RMSE (Vol Penalty)</span>
                <div className="metric-icon-badge metric-icon-navy">
                  <Zap size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <div className="metric-card-value">
                  {metrics?.rmse != null ? `${Math.round(metrics.rmse).toLocaleString()}` : '—'}
                  <span className="metric-unit">MW</span>
                </div>
              </div>
              <div className="metric-card-sub">
                <span>Penalizes extreme outliers</span>
                <span className="badge badge-amber">Risk Tier</span>
              </div>
            </motion.div>

            {/* Bias: From CENTER */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className={`metric-card-pro ${(metrics?.meanSignedError || 0) > 0 ? 'card-red' : 'card-blue'}`}
            >
              <div className="metric-card-header">
                <span className="metric-card-label">Mean Signed Bias</span>
                <div className={`metric-icon-badge ${(metrics?.meanSignedError || 0) > 0 ? 'metric-icon-red' : 'metric-icon-blue'}`}>
                  <Clock size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <div className="metric-card-value" style={{ color: (metrics?.meanSignedError || 0) > 0 ? '#DC2626' : '#2563EB' }}>
                  {metrics?.meanSignedError != null
                    ? `${metrics.meanSignedError > 0 ? '+' : ''}${Math.round(metrics.meanSignedError).toLocaleString()}`
                    : '—'}
                  <span className="metric-unit">MW</span>
                </div>
              </div>
              <div className="metric-card-sub">
                <span>{(metrics?.meanSignedError || 0) > 0 ? 'Net Overforecast' : 'Net Underforecast'}</span>
                <span className={`badge ${(metrics?.meanSignedError || 0) > 0 ? 'badge-red' : 'badge-blue'}`}>
                  {(metrics?.meanSignedError || 0) > 0 ? 'Shortfall' : 'Surplus'}
                </span>
              </div>
            </motion.div>

            {/* WAPE: From CENTER */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-amber"
            >
              <div className="metric-card-header">
                <span className="metric-card-label">WAPE Error</span>
                <div className="metric-icon-badge metric-icon-amber">
                  <ShieldCheck size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <div className="metric-card-value">
                  {metrics?.wape != null ? `${metrics.wape.toFixed(1)}%` : '—'}
                </div>
              </div>
              <div className="metric-card-sub">
                <span>Weighted by fleet volume</span>
                <span className="badge badge-green">Standard</span>
              </div>
            </motion.div>

            {/* Safe MAPE: From RIGHT-CENTER */}
            <motion.div
              initial={{ opacity: 0, y: 35, x: 25 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-blue"
            >
              <div className="metric-card-header">
                <span className="metric-card-label">Filtered MAPE</span>
                <div className="metric-icon-badge metric-icon-blue">
                  <Layers size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <div className="metric-card-value">
                  {metrics?.mape != null ? `${metrics.mape.toFixed(1)}%` : '—'}
                </div>
              </div>
              <div className="metric-card-sub">
                <span>Safe cutoff: Actual ≥ 100 MW</span>
                <span className="badge badge-blue">Noise-Safe</span>
              </div>
            </motion.div>

            {/* Completeness: From RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-green"
            >
              <div className="metric-card-header">
                <span className="metric-card-label">Data Coverage</span>
                <div className="metric-icon-badge metric-icon-green">
                  <ShieldCheck size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <div className="metric-card-value" style={{ color: '#059669' }}>
                  {metrics?.completenessPercent != null ? `${metrics.completenessPercent}%` : '—'}
                </div>
              </div>
              <div className="metric-card-sub">
                <span>{metrics?.validMatchedCount || 0} valid SPs</span>
                <span className="badge badge-green">Verified</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* DIURNAL ERROR PROFILE SECTION */}
      <section style={{ padding: '12px 0 32px 0' }}>
        <div className="container">
          <div className="ws-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--navy-deep)', fontWeight: 800, letterSpacing: '-0.01em' }}>
                  Diurnal Error Profile by Settlement Period (SP 1 to 48)
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                  Average forecast error profile throughout the 24-hour delivery cycle. Demonstrates systematic morning and evening ramp performance across Great Britain.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#2563EB', borderRadius: '3px' }} />
                  <span style={{ color: '#1E293B' }}>MAE (MW)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#07172B', borderRadius: '3px' }} />
                  <span style={{ color: '#1E293B' }}>RMSE (MW)</span>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '360px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodProfiles} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="timeLabel"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    stroke="#E2E8F0"
                    interval={3}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    stroke="#E2E8F0"
                    unit=" MW"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#07172B',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    }}
                    formatter={(val: any, name: any) => [
                      `${Math.round(val).toLocaleString()} MW`,
                      name === 'mae' ? 'Mean Absolute Error' : 'Root Mean Square Error',
                    ]}
                  />
                  <Bar dataKey="mae" name="mae" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rmse" name="rmse" fill="#07172B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* TWO COLUMN SECTION: DAILY TRENDS & ERROR HISTOGRAM */}
      <section style={{ padding: '0 0 32px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '24px',
          }}>
            
            {/* Daily Trend */}
            <div className="ws-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--navy-deep)', fontWeight: 800 }}>
                Daily MAE Evolution (January 2026)
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', marginBottom: '16px' }}>
                Day-by-day progression of forecast error across high and low wind weather regimes.
              </p>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(8)}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      stroke="#E2E8F0"
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      stroke="#E2E8F0"
                      unit=" MW"
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#07172B', borderRadius: '12px', color: '#FFFFFF' }}
                      formatter={(val: any) => [`${Math.round(val).toLocaleString()} MW`, 'Daily MAE']}
                    />
                    <Line
                      type="monotone"
                      dataKey="mae"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#2563EB', strokeWidth: 1, stroke: '#FFFFFF' }}
                      activeDot={{ r: 6, fill: '#F59E0B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Error Distribution Histogram */}
            <div className="ws-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--navy-deep)', fontWeight: 800 }}>
                Signed Error Distribution Histogram
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', marginBottom: '16px' }}>
                Frequency distribution of (Forecast − Actual) errors across all January 2026 intervals.
              </p>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramBins} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#64748B', fontSize: 9 }}
                      interval={2}
                      angle={-20}
                      textAnchor="end"
                      stroke="#E2E8F0"
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      stroke="#E2E8F0"
                      unit=" SPs"
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#07172B', borderRadius: '12px', color: '#FFFFFF' }}
                      formatter={(val: any) => [`${val} Settlement Periods`, 'Count']}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* EXTREME TAIL-RISK IMBALANCE EVENTS TABLE */}
      <section style={{ padding: '0 0 32px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '24px',
          }}>
            
            {/* Top Overforecasts */}
            <div className="table-pro-wrapper">
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={20} color="#DC2626" />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-deep)', fontWeight: 800 }}>
                      Largest Overforecast Events (F ≫ A)
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Forecast exceeded delivery. Imbalance volume shortfall penalty.
                    </p>
                  </div>
                </div>
                <span className="badge badge-red">Shortfall Risk</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="table-pro">
                  <thead>
                    <tr>
                      <th>Time (UTC)</th>
                      <th style={{ textAlign: 'right' }}>Forecast (MW)</th>
                      <th style={{ textAlign: 'right' }}>Actual (MW)</th>
                      <th style={{ textAlign: 'right' }}>Error Delta (MW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topOver.map((ev, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy-deep)' }}>
                          {ev.startTime.replace('T', ' ').slice(0, 16)}
                        </td>
                        <td className="num-cell" style={{ color: '#2563EB' }}>
                          {Math.round(ev.forecastMW).toLocaleString()}
                        </td>
                        <td className="num-cell">
                          {Math.round(ev.actualMW).toLocaleString()}
                        </td>
                        <td className="num-cell" style={{ color: '#DC2626', fontWeight: 800 }}>
                          +{Math.round(ev.signedErrorMW).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Underforecasts */}
            <div className="table-pro-wrapper">
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingDown size={20} color="#2563EB" />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-deep)', fontWeight: 800 }}>
                      Largest Underforecast Events (F ≪ A)
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Actual outturn exceeded forecast. Spill, spillover, or surplus imbalance risk.
                    </p>
                  </div>
                </div>
                <span className="badge badge-blue">Surplus Spill</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="table-pro">
                  <thead>
                    <tr>
                      <th>Time (UTC)</th>
                      <th style={{ textAlign: 'right' }}>Forecast (MW)</th>
                      <th style={{ textAlign: 'right' }}>Actual (MW)</th>
                      <th style={{ textAlign: 'right' }}>Error Delta (MW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUnder.map((ev, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy-deep)' }}>
                          {ev.startTime.replace('T', ' ').slice(0, 16)}
                        </td>
                        <td className="num-cell" style={{ color: '#2563EB' }}>
                          {Math.round(ev.forecastMW).toLocaleString()}
                        </td>
                        <td className="num-cell">
                          {Math.round(ev.actualMW).toLocaleString()}
                        </td>
                        <td className="num-cell" style={{ color: '#0284C7', fontWeight: 800 }}>
                          {Math.round(ev.signedErrorMW).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

