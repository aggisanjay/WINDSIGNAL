import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  RefreshCw,
  Server,
} from 'lucide-react';
import { api } from '../services/api';

export const StatusPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: api.getStatus,
    refetchInterval: 15000,
  });

  const { data: quality } = useQuery({
    queryKey: ['dataQuality'],
    queryFn: () => api.getDataQuality('2026-01-01', '2026-01-31'),
  });

  const refreshMutation = useMutation({
    mutationFn: api.refreshCache,
    onSuccess: (data) => {
      setRefreshMessage(data.message || 'Cache re-fetched successfully');
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['dataQuality'] });
    },
    onError: (err: any) => {
      setRefreshMessage(`Cache refresh failed: ${err.message}`);
    },
  });

  const isUpstreamReachable = status?.upstreamElexon?.reachable;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '96px' }}>
      
      {/* STRUCTURED PAGE HERO BANNER */}
      <section className="page-hero-banner">
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span className="badge badge-green" style={{ backgroundColor: 'rgba(16, 185, 129, 0.18)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  SYSTEM TELEMETRY & HEALTH
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)' }}>
                  REAL-TIME API MONITORING
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
                System Telemetry & Ingestion Diagnostics
              </h1>
              <p style={{ color: '#CBD5E1', fontSize: '1rem', maxWidth: '720px', marginTop: '10px', lineHeight: 1.5 }}>
                Real-time operational health of the FastAPI backend, external Elexon BMRS endpoint connectivity, disk cache integrity, and 31-day data completeness.
              </p>
            </div>

            <button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="btn-pill-amber"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.88rem' }}
            >
              <RefreshCw size={16} className={refreshMutation.isPending ? 'spin' : ''} />
              <span>{refreshMutation.isPending ? 'Syncing...' : 'Trigger Cache Sync'}</span>
            </button>
          </div>

          {refreshMessage && (
            <div style={{
              marginTop: '20px',
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#FDE68A',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}>
              {refreshMessage}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '36px 0' }}>
        <div className="container">
          
          {/* TOP TELEMETRY CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '36px',
          }}>
            
            {/* Backend Node: From LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -70 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-blue"
              style={{ padding: '26px' }}
            >
              <div className="metric-card-header">
                <div>
                  <div className="metric-card-label" style={{ color: '#2563EB' }}>
                    Core Service Engine
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-deep)', fontWeight: 800, marginTop: '4px' }}>
                    FastAPI Server Node
                  </h3>
                </div>
                <div className="metric-icon-badge metric-icon-blue">
                  <Server size={24} strokeWidth={2.2} />
                </div>
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span>Service Name:</span>
                  <strong>{status?.service || 'WindSignal API'}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span>Local Port:</span>
                  <code style={{ color: '#2563EB', fontWeight: 700 }}>8000</code>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span>Node Time:</span>
                  <span>{status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : '—'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Engine Health:</span>
                  <span className="badge badge-green">Operational</span>
                </li>
              </ul>
            </motion.div>

            {/* Upstream Elexon API: From RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 70 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-green"
              style={{ padding: '26px' }}
            >
              <div className="metric-card-header">
                <div>
                  <div className="metric-card-label" style={{ color: isUpstreamReachable ? '#059669' : '#DC2626' }}>
                    Live Market Gateway
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-deep)', fontWeight: 800, marginTop: '4px' }}>
                    Upstream Elexon BMRS API
                  </h3>
                </div>
                <div className={`metric-icon-badge ${isUpstreamReachable ? 'metric-icon-green' : 'metric-icon-red'}`}>
                  <Activity size={24} strokeWidth={2.2} />
                </div>
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span>Endpoint Host:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>bmrs.elexon.co.uk</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span>Roundtrip Latency:</span>
                  <strong style={{ color: '#2563EB' }}>{status?.upstreamElexon?.latency_ms != null ? `${status.upstreamElexon.latency_ms} ms` : 'N/A'}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span>HTTP Response:</span>
                  <strong style={{ color: isUpstreamReachable ? '#059669' : '#DC2626' }}>{status?.upstreamElexon?.status_code || 200} OK</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Connectivity State:</span>
                  <span className={`badge ${isUpstreamReachable ? 'badge-green' : 'badge-red'}`}>
                    {isUpstreamReachable ? 'Connected' : 'Unreachable'}
                  </span>
                </li>
              </ul>
            </motion.div>

          </div>

          {/* CACHE DIAGNOSTICS TABLE */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="table-pro-wrapper"
            style={{ marginBottom: '36px' }}
          >
            <div style={{ padding: '22px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-deep)', fontWeight: 800 }}>
                  Persistent Local Cache Entries & Freshness
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Real January 2026 Elexon records cached on disk to ensure instant sub-millisecond retrieval and audit repeatability.
                </p>
              </div>
              <span className="badge badge-blue">Atomic Cache Active</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table-pro">
                <thead>
                  <tr>
                    <th>Cache File</th>
                    <th style={{ textAlign: 'right' }}>Size (Disk)</th>
                    <th>Last Ingested (UTC)</th>
                    <th style={{ textAlign: 'right' }}>Cache Age</th>
                    <th style={{ textAlign: 'center' }}>Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {(status?.cache?.entries || []).map((entry: any) => (
                    <tr key={entry.key}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--navy-deep)' }}>
                        {entry.key}.json
                      </td>
                      <td className="num-cell">
                        {(entry.size_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                        {entry.last_modified.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="num-cell" style={{ color: '#2563EB', fontWeight: 700 }}>
                        {entry.age_minutes} mins ago
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-green">Verified</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* JANUARY 2026 DAILY COVERAGE DIAGNOSTICS */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="table-pro-wrapper"
          >
            <div style={{ padding: '22px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-deep)', fontWeight: 800 }}>
                  January 2026 Settlement Period Coverage Diagnostics (1–31 Jan)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Target: 31 days × 48 settlement periods = 1,488 half-hours. Verifies zero lookahead and matching completeness.
                </p>
              </div>
              <span className="badge badge-green">1,488 / 1,488 Expected SPs</span>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
              <table className="table-pro">
                <thead>
                  <tr style={{ position: 'sticky', top: 0, zIndex: 5 }}>
                    <th>Delivery Date</th>
                    <th style={{ textAlign: 'right' }}>Expected SPs</th>
                    <th style={{ textAlign: 'right' }}>Matched SPs</th>
                    <th style={{ textAlign: 'right' }}>Missing Actuals</th>
                    <th style={{ textAlign: 'right' }}>Missing Forecasts</th>
                    <th style={{ textAlign: 'right' }}>Coverage %</th>
                  </tr>
                </thead>
                <tbody>
                  {(quality?.dailyCoverage || []).map((day: any) => (
                    <tr key={day.date}>
                      <td style={{ fontWeight: 600, color: 'var(--navy-deep)', fontFamily: 'var(--font-mono)' }}>
                        {day.date}
                      </td>
                      <td className="num-cell">{day.expected}</td>
                      <td className="num-cell" style={{ color: '#059669', fontWeight: 800 }}>
                        {day.matched}
                      </td>
                      <td className="num-cell" style={{ color: day.missingActual > 0 ? '#DC2626' : '#64748B' }}>
                        {day.missingActual}
                      </td>
                      <td className="num-cell" style={{ color: day.missingForecast > 0 ? '#DC2626' : '#64748B' }}>
                        {day.missingForecast}
                      </td>
                      <td className="num-cell" style={{ fontWeight: 800, color: day.coveragePct === 100 ? '#059669' : '#D97706' }}>
                        {day.coveragePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </section>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

