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
import { Calendar, History, Clock, Layers } from 'lucide-react';
import { api } from '../services/api';

export const PublicationsPage: React.FC = () => {
  const [deliveryDate, setDeliveryDate] = useState('2026-01-15');
  const [vintage1, setVintage1] = useState<string>('');
  const [vintage2, setVintage2] = useState<string>('');

  const { data: pubData, isLoading } = useQuery({
    queryKey: ['publications', deliveryDate],
    queryFn: () => api.getPublications(deliveryDate),
  });

  const publications = pubData?.publications || [];

  // Default vintages if not explicitly selected
  const activeVintage1 = vintage1 || (publications[0]?.publishTime || '');
  const activeVintage2 = vintage2 || (publications[Math.min(3, publications.length - 1)]?.publishTime || '');

  // Fetch forecast series for vintage 1
  const { data: data1 } = useQuery({
    queryKey: ['forecastIntelligence', deliveryDate, 'vintage1', activeVintage1],
    queryFn: () =>
      api.getForecastIntelligence({
        deliveryDate,
        explicitPublishTime: activeVintage1,
      }),
    enabled: Boolean(activeVintage1),
  });

  // Fetch forecast series for vintage 2
  const { data: data2 } = useQuery({
    queryKey: ['forecastIntelligence', deliveryDate, 'vintage2', activeVintage2],
    queryFn: () =>
      api.getForecastIntelligence({
        deliveryDate,
        explicitPublishTime: activeVintage2,
      }),
    enabled: Boolean(activeVintage2),
  });

  // Combine for comparison chart
  const intervals1 = data1?.intervals || [];
  const intervals2 = data2?.intervals || [];

  const comparisonChartData = intervals1.map((i, idx) => {
    const f2 = intervals2[idx]?.forecastMW;
    return {
      time: i.startTime.slice(11, 16),
      actual: i.actualMW,
      forecastVintage1: i.forecastMW,
      forecastVintage2: f2,
    };
  });

  const selectedPub1 = publications.find(p => p.publishTime === activeVintage1);
  const selectedPub2 = publications.find(p => p.publishTime === activeVintage2);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '96px' }}>
      
      {/* STRUCTURED PAGE HERO BANNER */}
      <section className="page-hero-banner">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-amber" style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
              MULTI-VINTAGE FORECAST TRAJECTORY
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>•</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)' }}>
              REAL ELEXON WINDFOR PUBLICATION HISTORY
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
            Publication Vintage Trajectory Explorer
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1rem', maxWidth: '720px', marginTop: '10px', lineHeight: 1.5 }}>
            Audit every distinct forecast issued by National Grid ESO for a given target delivery date. Track how forecast volatility and error compress as lead-time closes to gate closure.
          </p>
        </div>
      </section>

      {/* FILTER TOOLBAR */}
      <section style={{ marginTop: '-24px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="filter-toolbar-pro">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--energy-blue)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Delivery Date:
                </span>
                <input
                  type="date"
                  min="2026-01-01"
                  max="2026-01-31"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    setVintage1('');
                    setVintage2('');
                  }}
                  className="filter-input-pro"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-blue">
                  {publications.length} distinct forecast publications logged
                </span>
              </div>

            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
              {isLoading ? 'Loading publications...' : `Delivery Date: ${deliveryDate}`}
            </div>
          </div>
        </div>
      </section>

      {/* COMPARATIVE VINTAGE SELECTION & METRIC CARDS */}
      <section style={{ padding: '8px 0 32px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}>
            
            {/* Vintage 1 Card: From LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -70 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-blue"
            >
              <div className="metric-card-header">
                <span className="metric-card-label" style={{ color: '#2563EB' }}>
                  Forecast Vintage 1 (Early Horizon)
                </span>
                <div className="metric-icon-badge metric-icon-blue">
                  <History size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div style={{ margin: '8px 0 12px 0' }}>
                <select
                  value={activeVintage1}
                  onChange={(e) => setVintage1(e.target.value)}
                  className="filter-input-pro"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  {publications.map((p) => (
                    <option key={p.publishTime} value={p.publishTime}>
                      Published: {p.publishTime.replace('T', ' ').slice(0, 16)} UTC ({p.avgLeadTimeHours}h lead)
                    </option>
                  ))}
                </select>
              </div>
              <div className="metric-card-sub">
                <span>Lead Time: <strong>{selectedPub1?.avgLeadTimeHours || '—'} hours</strong></span>
                <span className="badge badge-blue">{selectedPub1?.intervalCount || 0} intervals</span>
              </div>
            </motion.div>

            {/* Vintage 2 Card: From MIDDLE */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-amber"
            >
              <div className="metric-card-header">
                <span className="metric-card-label" style={{ color: '#D97706' }}>
                  Forecast Vintage 2 (Late Horizon)
                </span>
                <div className="metric-icon-badge metric-icon-amber">
                  <Clock size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div style={{ margin: '8px 0 12px 0' }}>
                <select
                  value={activeVintage2}
                  onChange={(e) => setVintage2(e.target.value)}
                  className="filter-input-pro"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  {publications.map((p) => (
                    <option key={p.publishTime} value={p.publishTime}>
                      Published: {p.publishTime.replace('T', ' ').slice(0, 16)} UTC ({p.avgLeadTimeHours}h lead)
                    </option>
                  ))}
                </select>
              </div>
              <div className="metric-card-sub">
                <span>Lead Time: <strong>{selectedPub2?.avgLeadTimeHours || '—'} hours</strong></span>
                <span className="badge badge-amber">{selectedPub2?.intervalCount || 0} intervals</span>
              </div>
            </motion.div>

            {/* Outturn Actuals Card: From RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 70 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-navy"
            >
              <div className="metric-card-header">
                <span className="metric-card-label" style={{ color: '#07172B' }}>
                  Settlement Actual Outturn
                </span>
                <div className="metric-icon-badge metric-icon-navy">
                  <Layers size={22} strokeWidth={2.2} />
                </div>
              </div>
              <div style={{ margin: '6px 0 10px 0' }}>
                <div className="metric-card-value" style={{ fontSize: '1.8rem', marginBottom: '2px' }}>
                  Elexon FUELHH
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>GB Metered Generation Truth</span>
              </div>
              <div className="metric-card-sub">
                <span>Direct metered wind outturn</span>
                <span className="badge badge-green">Ground Truth</span>
              </div>
            </motion.div>

          </div>

          {/* VINTAGE COMPARISON CHART */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="ws-card"
            style={{ padding: '28px', backgroundColor: '#FFFFFF', marginBottom: '36px' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--navy-deep)', fontWeight: 800 }}>
                  Forecast Trajectory: Vintage 1 vs Vintage 2 vs Outturn
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                  Visual comparison showing how generation expectations evolved across successive publication iterations.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '14px', height: '3px', backgroundColor: '#07172B' }} />
                  <span style={{ color: '#07172B' }}>Actual Outturn</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '14px', height: '3px', backgroundColor: '#2563EB', borderTop: '2px dashed #2563EB' }} />
                  <span style={{ color: '#2563EB' }}>Vintage 1</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '14px', height: '3px', backgroundColor: '#F59E0B', borderTop: '2px dotted #F59E0B' }} />
                  <span style={{ color: '#D97706' }}>Vintage 2</span>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '380px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="time" stroke="#E2E8F0" tick={{ fill: '#64748B', fontSize: 11 }} interval={3} />
                  <YAxis stroke="#E2E8F0" tick={{ fill: '#64748B', fontSize: 11 }} unit=" MW" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#07172B',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                    formatter={(val: any, name: any) => [
                      `${Math.round(val).toLocaleString()} MW`,
                      name === 'actual' ? 'Actual Generation' : name === 'forecastVintage1' ? 'Vintage 1 Forecast' : 'Vintage 2 Forecast',
                    ]}
                  />
                  <Line type="monotone" dataKey="actual" name="actual" stroke="#07172B" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="forecastVintage1" name="forecastVintage1" stroke="#2563EB" strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
                  <Line type="monotone" dataKey="forecastVintage2" name="forecastVintage2" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* DISTINCT PUBLICATIONS REGISTRY TABLE */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="table-pro-wrapper"
          >
            <div style={{ padding: '22px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-deep)', fontWeight: 800 }}>
                  Complete Publication Registry for {deliveryDate}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Derived directly from the official Elexon WINDFOR stream. Every published vintage is uniquely preserved.
                </p>
              </div>
              <span className="badge badge-green">Elexon Stream Verified</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table-pro">
                <thead>
                  <tr>
                    <th>Publication Timestamp (UTC)</th>
                    <th style={{ textAlign: 'right' }}>Target Periods</th>
                    <th>Earliest Interval</th>
                    <th>Latest Interval</th>
                    <th style={{ textAlign: 'right' }}>Average Lead Time</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--navy-deep)' }}>
                        {p.publishTime.replace('T', ' ').slice(0, 16)} UTC
                      </td>
                      <td className="num-cell">
                        {p.intervalCount} SPs
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                        {p.minDeliveryStart.slice(11, 16)} UTC
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                        {p.maxDeliveryStart.slice(11, 16)} UTC
                      </td>
                      <td className="num-cell" style={{ color: '#2563EB', fontWeight: 700 }}>
                        {p.avgLeadTimeHours} hours
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setVintage1(p.publishTime)}
                          className="btn-light"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                        >
                          Select as V1
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
};

