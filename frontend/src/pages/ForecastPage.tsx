import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  Clock,
  Download,
  Filter,
  Layers,
  TrendingDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export const ForecastPage: React.FC = () => {
  const [deliveryDate, setDeliveryDate] = useState('2026-01-15');
  const [cutoffType, setCutoffType] = useState('DA_1100');
  const [matchingMode, setMatchingMode] = useState('hour_block');
  const [selectedVintage, setSelectedVintage] = useState<string>('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['forecastIntelligence', deliveryDate, cutoffType, matchingMode, selectedVintage],
    queryFn: () =>
      api.getForecastIntelligence({
        deliveryDate,
        cutoffType,
        matchingMode,
        explicitPublishTime: selectedVintage || undefined,
      }),
  });

  const intervals = data?.intervals || [];
  const metrics = data?.metrics;
  const publications = data?.availablePublications || [];

  const chartData = intervals.map((i) => {
    const timeStr = i.startTime.slice(11, 16);
    return {
      time: timeStr,
      fullTime: i.startTime,
      period: i.settlementPeriod,
      actual: i.actualMW,
      forecast: i.forecastMW,
      signedError: i.signedErrorMW,
      absError: i.absoluteErrorMW,
      status: i.status,
    };
  });

  const exportUrl = api.getExportCsvUrl({
    dateFrom: deliveryDate,
    dateTo: deliveryDate,
    cutoffType,
  });

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '96px' }}>
      
      {/* STRUCTURED PAGE HERO BANNER */}
      <section className="page-hero-banner">
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span className="badge badge-amber" style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                  OPERATIONAL DECISION TERMINAL
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)' }}>
                  REAL ELEXON BMRS FUELHH & WINDFOR
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
                Day-Ahead Forecast Intelligence
              </h1>
              <p style={{ color: '#CBD5E1', fontSize: '1rem', maxWidth: '720px', marginTop: '10px', lineHeight: 1.5 }}>
                Evaluate day-ahead forecast publications against actual metered outturn generation for any January 2026 delivery date. Strict anti-lookahead historical vintage selection.
              </p>
            </div>

            <a
              href={exportUrl}
              download
              className="btn-pill-amber"
              style={{ padding: '12px 24px', fontSize: '0.88rem' }}
            >
              <Download size={16} />
              <span>Export Delivery Day CSV</span>
            </a>
          </div>
        </div>
      </section>

      {/* STRUCTURED CONTROLS TOOLBAR */}
      <section style={{ marginTop: '-24px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="filter-toolbar-pro">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px' }}>
              
              {/* Delivery Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--energy-blue)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Delivery Date:
                </span>
                <input
                  type="date"
                  min="2026-01-01"
                  max="2026-01-31"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    setSelectedVintage('');
                  }}
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

              {/* Resolution Toggle */}
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
                  <option value="exact">Exact (24 SPs/day)</option>
                </select>
              </div>

              {/* Specific Publication Override */}
              {publications.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="var(--energy-blue)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Vintage:
                  </span>
                  <select
                    value={selectedVintage}
                    onChange={(e) => setSelectedVintage(e.target.value)}
                    className="filter-input-pro"
                    style={{ maxWidth: '240px' }}
                  >
                    <option value="">Auto (Cutoff Argmax)</option>
                    {publications.map((p) => (
                      <option key={p.publishTime} value={p.publishTime}>
                        {p.publishTime.replace('T', ' ').slice(0, 16)} UTC ({p.avgLeadTimeHours}h lead)
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
              {isLoading ? 'Streaming Elexon cache...' : `${intervals.length} SPs Loaded`}
            </div>
          </div>
        </div>
      </section>

      {/* METRIC KPI CARDS */}
      <section style={{ padding: '8px 0 0 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '18px',
            marginBottom: '32px',
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
                <span>Average volume deviation</span>
                <span className="badge badge-blue">Baseline</span>
              </div>
            </motion.div>

            {/* RMSE: From MID-LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 40, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-navy"
            >
              <div className="metric-card-header">
                <span className="metric-card-label">Root Mean Sq Error</span>
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
                <span>Tail-risk volatility penalty</span>
                <span className="badge badge-amber">Volatility</span>
              </div>
            </motion.div>

            {/* Signed Bias: From MIDDLE */}
            <motion.div
              initial={{ opacity: 0, y: 45, scale: 0.94 }}
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
                <span>{(metrics?.meanSignedError || 0) > 0 ? 'Overforecast Net Tendency' : 'Underforecast Net Tendency'}</span>
                <span className={`badge ${(metrics?.meanSignedError || 0) > 0 ? 'badge-red' : 'badge-blue'}`}>
                  {(metrics?.meanSignedError || 0) > 0 ? 'Shortfall' : 'Surplus'}
                </span>
              </div>
            </motion.div>

            {/* WAPE: From MID-RIGHT */}
            <motion.div
              initial={{ opacity: 0, y: 40, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-amber"
            >
              <div className="metric-card-header">
                <span className="metric-card-label">WAPE Metric</span>
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
                <span>Fleet volume weighted error</span>
                <span className="badge badge-amber">Standard</span>
              </div>
            </motion.div>

            {/* Data Completeness: From RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-green"
            >
              <div className="metric-card-header">
                <span className="metric-card-label">Coverage Rate</span>
                <div className="metric-icon-badge metric-icon-green">
                  <Layers size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <div className="metric-card-value" style={{ color: '#059669' }}>
                  {metrics?.validMatchedCount} / {metrics?.totalExpectedIntervals}
                </div>
              </div>
              <div className="metric-card-sub">
                <span>{metrics?.completenessPercent}% observed intervals</span>
                <span className="badge badge-green">Verified</span>
              </div>
            </motion.div>

          </div>

          {/* DUAL-SERIES CHART IN PROFESSIONAL TERMINAL CONTAINER */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="ws-card"
            style={{ padding: '28px', backgroundColor: '#FFFFFF', marginBottom: '36px' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-deep)', letterSpacing: '-0.01em' }}>
                  Half-Hourly Generation: Forecast vs Actual Outturn
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                  Delivery Date: <strong style={{ color: 'var(--navy-deep)' }}>{deliveryDate}</strong> | Decision Cutoff: <strong style={{ color: 'var(--energy-blue)' }}>{cutoffType}</strong>
                </p>
              </div>

              {/* Series Legend Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ width: '12px', height: '4px', backgroundColor: '#07172B', borderRadius: '2px' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#07172B' }}>Actual Outturn (FUELHH)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ width: '12px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563EB' }}>Selected Forecast (WINDFOR)</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                Streaming Elexon cache records...
              </div>
            ) : isError ? (
              <div style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                Error loading data: {(error as Error).message}
              </div>
            ) : (
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      stroke="#E2E8F0"
                      interval={3}
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      stroke="#E2E8F0"
                      unit=" MW"
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#07172B',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#FFFFFF',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                      }}
                      formatter={(val: any, name: any) => [
                        `${Number(val).toLocaleString()} MW`,
                        name === 'actual' ? 'Actual Generation' : 'Selected Forecast',
                      ]}
                      labelFormatter={(label: any) => {
                        const str = String(label || '00:00');
                        const parts = str.split(':');
                        const h = parseInt(parts[0] || '0');
                        const m = parseInt(parts[1] || '0');
                        const sp = (h * 2) + (m >= 30 ? 2 : 1);
                        return `Delivery Interval: ${str} UTC (Settlement Period ${sp})`;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#07172B"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#07172B' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      strokeDasharray="4 2"
                      dot={{ r: 2, fill: '#2563EB' }}
                      activeDot={{ r: 6, fill: '#2563EB' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* FINANCIAL TERMINAL SETTLEMENT TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="table-pro-wrapper"
          >
            <div style={{ padding: '22px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-deep)' }}>
                  Settlement Period Breakdown (Half-Hourly)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Audited settlement intervals with published forecast, observed actual, signed error, and lead-time provenance.
                </p>
              </div>
              <span className="badge badge-green">48 Settlement Intervals</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table-pro">
                <thead>
                  <tr>
                    <th>Settlement Period</th>
                    <th>Start (UTC)</th>
                    <th>Publish Time</th>
                    <th>Lead Time</th>
                    <th style={{ textAlign: 'right' }}>Forecast (MW)</th>
                    <th style={{ textAlign: 'right' }}>Actual (MW)</th>
                    <th style={{ textAlign: 'right' }}>Signed Error</th>
                    <th style={{ textAlign: 'right' }}>Abs Error</th>
                    <th style={{ textAlign: 'right' }}>Error %</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {intervals.map((i) => {
                    const isOver = (i.signedErrorMW || 0) > 0;
                    return (
                      <tr key={i.startTime}>
                        <td style={{ fontWeight: 800, color: 'var(--navy-deep)' }}>
                          SP {i.settlementPeriod}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {i.startTime.slice(11, 16)}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#64748B' }}>
                          {i.publishTime ? i.publishTime.replace('T', ' ').slice(0, 16) : '—'}
                        </td>
                        <td style={{ color: '#64748B', fontSize: '0.82rem' }}>
                          {i.leadTimeHours != null ? `${i.leadTimeHours}h` : '—'}
                        </td>
                        <td className="num-cell" style={{ color: '#2563EB' }}>
                          {i.forecastMW != null ? Math.round(i.forecastMW).toLocaleString() : '—'}
                        </td>
                        <td className="num-cell">
                          {i.actualMW != null ? Math.round(i.actualMW).toLocaleString() : '—'}
                        </td>
                        <td className="num-cell" style={{
                          fontWeight: 800,
                          color: isOver ? '#DC2626' : '#0284C7',
                        }}>
                          {i.signedErrorMW != null ? `${(isOver ? '+' : '')}${Math.round(i.signedErrorMW).toLocaleString()}` : '—'}
                        </td>
                        <td className="num-cell">
                          {i.absoluteErrorMW != null ? Math.round(i.absoluteErrorMW).toLocaleString() : '—'}
                        </td>
                        <td className="num-cell" style={{ color: '#64748B' }}>
                          {i.percentageError != null ? `${i.percentageError}%` : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {i.status === 'MATCHED' ? (
                            <span className="badge badge-green">MATCHED</span>
                          ) : (
                            <span className="badge badge-amber">MISSING</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </motion.div>

        </div>
      </section>
    </div>
  );
};

