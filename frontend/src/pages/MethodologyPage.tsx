import React from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  ShieldAlert,
  Database,
  Calculator,
  Clock,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* STRUCTURED PAGE HERO BANNER */}
      <section className="page-hero-banner">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-amber" style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
              INSTITUTIONAL METHODOLOGY
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>•</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)' }}>
              MATHEMATICAL FORMULATIONS & AUDIT STANDARDS
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
            Methodology & Scientific Transparency
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1rem', maxWidth: '720px', marginTop: '10px', lineHeight: 1.5 }}>
            Mathematical formulations, decision-cutoff conventions, data provenance, anti-lookahead rules, and explicit operational limitations governing the WindSignal platform.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 0' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          {/* Section 1: Data Sources */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="ws-card metric-card-pro card-blue"
            style={{ padding: '36px', marginBottom: '32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div className="metric-icon-badge metric-icon-blue" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <Database size={26} strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>Section 01 • Telemetry Feeds</span>
                <h2 style={{ fontSize: '1.45rem', color: 'var(--navy-deep)', fontWeight: 800, marginTop: '2px' }}>
                  Official Elexon BMRS Data Sources
                </h2>
              </div>
            </div>
            
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              WindSignal consumes open, non-proprietary data streams directly from the official Elexon Balancing Mechanism Reporting Service (BMRS) API:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-rule)', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ color: 'var(--navy-deep)', marginBottom: '6px', fontWeight: 700 }}>Actual Generation (FUELHH)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Half-hourly actual generation outturn by fuel type across Great Britain.
                </p>
                <ul style={{ fontSize: '0.82rem', color: '#64748B', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>• <strong>Filter:</strong> Strictly <code style={{ color: 'var(--energy-blue)' }}>fuelType == "WIND"</code></li>
                  <li>• <strong>Fields:</strong> startTime, settlementDate, settlementPeriod, generation</li>
                  <li>• <strong>Units:</strong> Megawatts (MW) average power across interval</li>
                </ul>
              </div>

              <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-rule)', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ color: 'var(--navy-deep)', marginBottom: '6px', fontWeight: 700 }}>Forecast Vintages (WINDFOR)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  National wind generation forecasts published by National Grid ESO.
                </p>
                <ul style={{ fontSize: '0.82rem', color: '#64748B', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>• <strong>Fields:</strong> startTime (delivery target), publishTime, generation</li>
                  <li>• <strong>Nature:</strong> Multi-vintage stream. A single delivery interval may have dozens of historical forecasts published as time approaches.</li>
                  <li>• <strong>Preservation:</strong> Every publishTime is preserved without averaging across vintages.</li>
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <a
                href="https://bmrs.elexon.co.uk/api-documentation"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-light"
                style={{ fontSize: '0.85rem' }}
              >
                <span>Elexon BMRS API Documentation</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>

          {/* Section 2: Historical Vintage Selection & Cutoff Logic */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="ws-card metric-card-pro card-amber"
            style={{ padding: '36px', marginBottom: '32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div className="metric-icon-badge metric-icon-amber" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <Clock size={26} strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>Section 02 • Decision Windows</span>
                <h2 style={{ fontSize: '1.45rem', color: 'var(--navy-deep)', fontWeight: 800, marginTop: '2px' }}>
                  Anti-Lookahead Vintage Selection & Decision Cutoffs
                </h2>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              In real electricity trading, market participants must submit bids before gate closure. Selecting a forecast published after this point introduces <strong>look-ahead bias</strong>, giving a false impression of forecast accuracy.
            </p>

            <div style={{
              background: '#07172B',
              color: '#E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              marginBottom: '20px',
              overflowX: 'auto',
            }}>
              Selected Forecast(t_delivery, t_cutoff) = argmax [publishTime ≤ t_cutoff] &#123; F(publishTime, t_delivery) &#125;
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              Supported Decision Cutoffs:
            </p>
            <ul style={{ fontSize: '0.88rem', color: 'var(--text-main)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <li><strong>Day-Ahead 11:00 UTC (Default):</strong> Aligns with the EPEX Spot UK Day-Ahead hourly auction order book closure.</li>
              <li><strong>Day-Ahead 12:00 UTC:</strong> Standard Nord Pool / EPEX UK half-hourly day-ahead gate closure.</li>
              <li><strong>Day-Ahead 17:00 UTC:</strong> Afternoon post-auction position rebalancing window.</li>
              <li><strong>Delivery Day 00:00 UTC:</strong> Midnight prior to physical delivery.</li>
            </ul>

            <div style={{ background: 'rgba(40,120,213,0.06)', border: '1px solid rgba(40,120,213,0.2)', borderRadius: '10px', padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <strong>Unmatched Observations:</strong> If no forecast was published at or before the cutoff for a delivery interval, the interval is strictly flagged as <code style={{ color: 'var(--energy-blue)' }}>MISSING_FORECAST</code>. It is excluded from accuracy metrics and never filled with zeros.
            </div>
          </motion.div>

          {/* Section 3: Mathematical Formulations */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="ws-card metric-card-pro card-green"
            style={{ padding: '36px', marginBottom: '32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div className="metric-icon-badge metric-icon-green" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <Calculator size={26} strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>Section 03 • Error Formulations</span>
                <h2 style={{ fontSize: '1.45rem', color: 'var(--navy-deep)', fontWeight: 800, marginTop: '2px' }}>
                  Mathematical Formulations & Metric Definitions
                </h2>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              For matched observations with forecast F_i and actual generation A_i across intervals i = 1 to N:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <strong style={{ color: 'var(--navy-deep)' }}>Signed Forecast Error (MW):</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  e_i = F_i - A_i. Positive error denotes overforecasting (potential power deficit); negative denotes underforecasting (potential surplus/spill).
                </p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <strong style={{ color: 'var(--navy-deep)' }}>Mean Absolute Error (MAE):</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  MAE = (1 / N) * Σ |F_i - A_i|. Quantifies the average magnitude of error in MW without regard to direction.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <strong style={{ color: 'var(--navy-deep)' }}>Root Mean Square Error (RMSE):</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  RMSE = sqrt[ (1 / N) * Σ (F_i - A_i)² ]. Disproportionately penalizes large forecast blunders, critical for assessing grid stress and balancing risk.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <strong style={{ color: 'var(--navy-deep)' }}>Mean Signed Error (Bias):</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  Bias = (1 / N) * Σ (F_i - A_i). Identifies systematic tendency of meteorological models to over- or under-predict.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <strong style={{ color: 'var(--navy-deep)' }}>Weighted Absolute Percentage Error (WAPE):</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  WAPE = [ Σ |F_i - A_i| / Σ A_i ] * 100%. Provides an aggregated volume-weighted error metric immune to division-by-zero instability at low wind intervals.
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--navy-deep)' }}>Safe Mean Absolute Percentage Error (Safe MAPE):</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  Filtered strictly for observations where A_i ≥ 100 MW. Standard percentage error becomes mathematically explosive when wind output drops near zero (e.g. 50 MW forecast on 1 MW actual is 4900% error).
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 4: Analytical Limitations */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="ws-card metric-card-pro card-red"
            style={{ padding: '36px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div className="metric-icon-badge metric-icon-amber" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <ShieldAlert size={26} strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>Section 04 • Boundary Conditions</span>
                <h2 style={{ fontSize: '1.45rem', color: 'var(--navy-deep)', fontWeight: 800, marginTop: '2px' }}>
                  Mandatory Scope & Analytical Limitations
                </h2>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              The user and reviewing technical lead must understand the boundaries of this platform:
            </p>

            <ul style={{ fontSize: '0.88rem', color: 'var(--text-main)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Generation Scope:</strong> Only national wind actuals (FUELHH) and national wind forecasts (WINDFOR) are in scope. Solar, biomass, CCGT, nuclear, and hydro generation are not included in the error metrics.</li>
              <li><strong>No Consumer Demand Data:</strong> The supplied datasets do not contain national electricity demand or transmission losses. Forecast error in wind generation does NOT equal the utility's total procurement shortfall.</li>
              <li><strong>Decision Support Only:</strong> WindSignal is designed for risk quantification and historical procurement evaluation. It does not execute automated trades, place market orders, or calculate final settlement cash-out bills.</li>
            </ul>
          </motion.div>

        </div>
      </section>
    </div>
  );
};
