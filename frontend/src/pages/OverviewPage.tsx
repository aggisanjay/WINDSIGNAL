import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Zap,
  TrendingDown,
  ShieldCheck,
  Globe2,
  Sparkles,
  Wind,
  Layers,
  Clock,
  Database,
  BarChart3,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { Hero3DTiltCard } from '../components/common/Hero3DTiltCard';

export const OverviewPage: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.getOverview('2026-01'),
  });

  return (
    <div style={{ backgroundColor: '#FFFFFF', overflowX: 'hidden' }}>
      
      {/* =========================================================================
          HERO SECTION — DIRECTIONAL REVEAL (LEFT: COPY / RIGHT: 3D CARD)
          ========================================================================= */}
      <section style={{
        position: 'relative',
        minHeight: '840px',
        color: '#FFFFFF',
        backgroundImage: `linear-gradient(180deg, rgba(7, 23, 43, 0.45) 0%, rgba(7, 23, 43, 0.85) 100%), url('/images/hero_sunnova_wind.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        padding: '36px 0 130px 0',
        overflow: 'hidden',
      }}>
        
        {/* GIANT CONDENSED DISPLAY WORD 'WIND' - GUARANTEED EXACT HORIZONTAL CENTER */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: 0,
            right: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-giant)',
              fontSize: 'clamp(6.5rem, 20vw, 17rem)',
              fontWeight: 900,
              lineHeight: 0.85,
              color: 'rgba(255, 255, 255, 0.88)',
              textShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
              letterSpacing: '0.04em',
              userSelect: 'none',
              textAlign: 'center',
              width: '100%',
            }}
          >
            WIND
          </motion.div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '560px' }}>
          
          {/* Top Bar inside Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}
          >
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              CLEAN ENERGY • BRIGHTER TOMORROW
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#E2E8F0' }}>
                POWERING THE UK
              </span>
              <Link
                to="/status"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textDecoration: 'none',
                }}
              >
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={10} fill="#07172B" color="#07172B" style={{ marginLeft: '1px' }} />
                </div>
                <span>LIVE ELEXON DATA</span>
              </Link>
            </div>
          </motion.div>

          {/* Hero Main Grid: Left reveals from LEFT (-80px), Right reveals from RIGHT (+80px) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '48px',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '36px',
              paddingBottom: '20px',
            }}
          >
            {/* Left Copy: Glides in from LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.9rem, 3.4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.025em',
                marginBottom: '18px',
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              }}>
                Sustainable Energy for a Brighter Tomorrow
              </h1>

              <p style={{
                fontSize: '0.96rem',
                color: '#F1F5F9',
                lineHeight: 1.55,
                fontWeight: 400,
                marginBottom: '32px',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                maxWidth: '480px',
              }}>
                High-performance wind generation forecasts, actual outturns, and quantified error metrics for UK utilities and power procurement desks.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <Link
                  to="/forecast"
                  className="btn-pill-amber"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#07172B',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.45)',
                    padding: '12px 26px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                  }}
                >
                  <span>Explore January 2026</span>
                  <ArrowRight size={16} />
                </Link>
                
                <Link
                  to="/accuracy"
                  className="btn-pill-dark"
                  style={{
                    padding: '12px 26px',
                    fontSize: '0.94rem',
                  }}
                >
                  <span>View Accuracy Analysis</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Glides in from RIGHT with 3D Tilt Card */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Hero3DTiltCard
                peakMW={overview?.peakActualGenerationMW || 16420}
                totalGWh={overview?.totalActualGenerationGWh || 6480}
                maeMW={overview?.overallMAE || 1110}
              />
            </motion.div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          3 FLOATING CARDS — DIRECTIONAL REVEAL:
          Card 1 from LEFT, Card 2 from MIDDLE, Card 3 from RIGHT
          ========================================================================= */}
      <section style={{ marginTop: '-55px', position: 'relative', zIndex: 10, paddingBottom: '48px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'stretch',
          }}>
            
            {/* Card 1: From LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -90 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="floating-card"
              style={{ padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', borderRadius: '18px', minHeight: '160px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div className="metric-icon-badge metric-icon-amber" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                      <Zap size={16} strokeWidth={2.4} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      FOR UTILITIES
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '8px', lineHeight: 1.25 }}>
                    Save More<br />Live Greener
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Reliable wind generation forecasts for a better tomorrow.
                  </p>
                </div>

                <Link to="/forecast" className="circular-arrow-btn" aria-label="Explore forecast">
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ width: '115px', height: '125px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src="/images/card_utilities_wind.jpg"
                  alt="Offshore wind turbines"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </motion.div>

            {/* Card 2: From MIDDLE (scale + Y) */}
            <motion.div
              initial={{ opacity: 0, y: 75, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="floating-card"
              style={{ padding: '26px', display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', borderRadius: '20px', minHeight: '185px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div className="metric-icon-badge metric-icon-green" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                      <TrendingDown size={16} strokeWidth={2.4} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      FOR BUSINESSES
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '8px', lineHeight: 1.25 }}>
                    Power Your<br />Business Growth
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Reduce energy risks and increase commercial sustainability.
                  </p>
                </div>

                <Link to="/accuracy" className="circular-arrow-btn" aria-label="Explore accuracy">
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ width: '130px', height: '140px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src="/images/card_business_energy.jpg"
                  alt="Procurement engineer with tablet"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </motion.div>

            {/* Card 3: From RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 90 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="floating-card"
              style={{ padding: '26px', display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', borderRadius: '20px', minHeight: '185px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div className="metric-icon-badge metric-icon-blue" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                      <Globe2 size={16} strokeWidth={2.4} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      FOR INDUSTRY
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '8px', lineHeight: 1.25 }}>
                    Large-Scale<br />Wind Solutions
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Custom wind analytics for maximum grid-scale efficiency.
                  </p>
                </div>

                <Link to="/publications" className="circular-arrow-btn" aria-label="Explore publications">
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ width: '130px', height: '140px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src="/images/card_industry_grid.jpg"
                  alt="Modern clean energy facility"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          METRICS STAT RIBBON — SMOOTH FADE FROM BOTTOM
          ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: '38px 0',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="metric-icon-badge metric-icon-amber" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <Zap size={26} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy-deep)', lineHeight: 1 }}>
                  {isLoading ? '...' : `${overview?.totalActualGenerationGWh?.toLocaleString()} GWh`}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Clean Wind Delivered (Jan 2026)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="metric-icon-badge metric-icon-blue" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <Wind size={26} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy-deep)', lineHeight: 1 }}>
                  {isLoading ? '...' : `${overview?.peakActualGenerationMW?.toLocaleString()} MW`}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Peak Actual Wind Output
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="metric-icon-badge metric-icon-green" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <TrendingDown size={26} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy-deep)', lineHeight: 1 }}>
                  {isLoading ? '...' : `${overview?.overallMAE?.toLocaleString()} MW`}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Overall Month MAE (11:00 Cutoff)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="metric-icon-badge metric-icon-navy" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <ShieldCheck size={26} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy-deep)', lineHeight: 1 }}>
                  1,488 SPs
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Half-Hourly Settlement Coverage
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          SECTION 1: GRID DECARBONISATION
          Left Image from LEFT (-80px), Right Story from RIGHT (+80px)
          ========================================================================= */}
      <section style={{ padding: '88px 0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '56px',
            alignItems: 'center',
          }}>
            
            {/* Left Image: Glides in from LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 48px rgba(7, 23, 43, 0.12)',
                position: 'relative',
                height: '420px',
              }}
            >
              <img
                src="/images/commercial_clean_energy.jpg"
                alt="Modern commercial clean energy facility"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Floating Live Badge Overlay */}
              <div style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                backgroundColor: 'rgba(7, 23, 43, 0.88)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                padding: '12px 18px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#CBD5E1' }}>
                    ELEXON BMRS SETTLEMENT
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B' }}>
                  14,240 MW Peak Dispatch
                </div>
              </div>

              {/* Bottom Video Badge */}
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                backgroundColor: 'rgba(7, 23, 43, 0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: '9999px',
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={11} fill="#07172B" color="#07172B" style={{ marginLeft: '1px' }} />
                </div>
                <span>How WindSignal Protects Procurement Desks</span>
              </div>
            </motion.div>

            {/* Right Story: Glides in from RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
                THE DECARBONISATION CHALLENGE
              </div>

              <h2 style={{
                fontFamily: 'var(--font-giant)',
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                lineHeight: 0.95,
                color: 'var(--navy-deep)',
                letterSpacing: '0.02em',
                marginBottom: '20px',
              }}>
                PREDICTING WIND<br />PROTECTING VALUE
              </h2>

              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
                As Great Britain targets a zero-carbon power grid, wind generation variability becomes the decisive factor in wholesale power pricing. Unforecasted generation swings drive severe system imbalance cash-out charges.
              </p>

              {/* 3 Structured Milestone Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div className="metric-icon-badge metric-icon-amber" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                    <Clock size={18} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '2px' }}>
                      EPEX Spot Day-Ahead Order Book Synchronization
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                      Strict evaluation at the 11:00 UTC auction cutoff guarantees zero lookahead bias in trading models.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div className="metric-icon-badge metric-icon-blue" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                    <BarChart3 size={18} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '2px' }}>
                      Tail-Risk & Ramp Penalty Tracking
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                      RMSE and safe-MAPE metrics penalize explosive forecast misses during extreme meteorological shifts.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div className="metric-icon-badge metric-icon-green" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                    <CheckCircle2 size={18} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '2px' }}>
                      Audit-Grade Elexon BMRS Verification
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                      100% matched half-hourly settlement intervals directly verified against National Grid FUELHH meter outturn.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/methodology"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--navy-deep)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                }}
              >
                <span>Read Full Methodology</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: PIPELINE (DIRECTIONAL REVEALS ACROSS CARDS)
          Card 1 from LEFT (-70), Card 2 from MID-LEFT, Card 3 from MID-RIGHT, Card 4 from RIGHT (+70)
          ========================================================================= */}
      <section style={{ padding: '88px 0', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div className="container">
          
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px auto' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: '#F59E0B', textTransform: 'uppercase', marginBottom: '8px' }}>
              HOW WINDSIGNAL WORKS
            </div>
            <h2 style={{
              fontFamily: 'var(--font-giant)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              lineHeight: 0.95,
              color: 'var(--navy-deep)',
              letterSpacing: '0.02em',
              marginBottom: '16px',
            }}>
              INTELLIGENCE PIPELINE
            </h2>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              From National Grid ESO publish timestamps to half-hourly settlement reconciliation, every byte of data is preserved with forensic accuracy.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {/* Step 1 Card: From LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -90 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-blue"
              style={{ padding: '0', overflow: 'hidden' }}
            >
              <div style={{ height: '160px', overflow: 'hidden' }}>
                <img
                  src="/images/media_1792905126505.png"
                  alt="Telemetry data stream ingestion"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>STEP 01</span>
                  <div className="metric-icon-badge metric-icon-blue" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                    <Database size={16} />
                  </div>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '8px' }}>
                  BMRS Data Ingestion
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45 }}>
                  Consumes official WINDFOR multi-vintage forecast streams and FUELHH outturns directly from Elexon APIs.
                </p>
              </div>
            </motion.div>

            {/* Step 2 Card: From MIDDLE-LEFT (Y + X) */}
            <motion.div
              initial={{ opacity: 0, y: 70, x: -30 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-amber"
              style={{ padding: '0', overflow: 'hidden' }}
            >
              <div style={{ height: '160px', overflow: 'hidden' }}>
                <img
                  src="/images/media_1792905229784.png"
                  alt="Procurement cutoff analysis"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>STEP 02</span>
                  <div className="metric-icon-badge metric-icon-amber" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                    <Clock size={16} />
                  </div>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '8px' }}>
                  Cutoff Decision Filter
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45 }}>
                  Strict argmax logic filters publications strictly prior to EPEX 11:00 UTC auction gate closure to avoid lookahead.
                </p>
              </div>
            </motion.div>

            {/* Step 3 Card: From MIDDLE-RIGHT (Y + X) */}
            <motion.div
              initial={{ opacity: 0, y: 70, x: 30 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-green"
              style={{ padding: '0', overflow: 'hidden' }}
            >
              <div style={{ height: '160px', overflow: 'hidden' }}>
                <img
                  src="/images/media_1792905175542.png"
                  alt="Wind error metrics"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>STEP 03</span>
                  <div className="metric-icon-badge metric-icon-green" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                    <Cpu size={16} />
                  </div>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '8px' }}>
                  Loss Function Matrix
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45 }}>
                  Computes MAE, RMSE, signed bias, and volume-weighted WAPE to identify systematic under- and over-forecasts.
                </p>
              </div>
            </motion.div>

            {/* Step 4 Card: From RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 90 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="metric-card-pro card-navy"
              style={{ padding: '0', overflow: 'hidden' }}
            >
              <div style={{ height: '160px', overflow: 'hidden' }}>
                <img
                  src="/images/media_1792905300055.png"
                  alt="Clean energy hedge dispatch"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#07172B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>STEP 04</span>
                  <div className="metric-icon-badge metric-icon-navy" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                    <Layers size={16} />
                  </div>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '8px' }}>
                  Dispatch Actionability
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45 }}>
                  Provides utility procurement teams with high-confidence hedging boundaries and vintage trajectory tracking.
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: CASE STUDY
          Left Story from LEFT (-80px), Right Image from RIGHT (+80px)
          ========================================================================= */}
      <section style={{ padding: '88px 0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '56px',
            alignItems: 'center',
          }}>
            
            {/* Left Story: From LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: '#F59E0B', textTransform: 'uppercase', marginBottom: '12px' }}>
                HISTORICAL CASE STUDY
              </div>

              <h2 style={{
                fontFamily: 'var(--font-giant)',
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                lineHeight: 0.95,
                color: 'var(--navy-deep)',
                letterSpacing: '0.02em',
                marginBottom: '20px',
              }}>
                JANUARY 2026<br />POLAR RAMP EVENT
              </h2>

              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                During the severe mid-January 2026 storm event, UK wind outturn surged by over 8,500 MW in under six hours. WindSignal tracked how meteorological forecasts evolved across successive publication horizons.
              </p>

              {/* 2 Metric Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>PEAK RAMP RATE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-deep)', margin: '4px 0' }}>+1,420 <span style={{ fontSize: '0.85rem' }}>MW/h</span></div>
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Jan 15, 2026 (SP 22–26)</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>ERROR COMPRESSION</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', margin: '4px 0' }}>-64% <span style={{ fontSize: '0.85rem' }}>MAE</span></div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>36h Lead vs 4h Lead</div>
                </div>
              </div>

              <Link
                to="/publications"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F59E0B',
                  color: '#07172B',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
                }}
              >
                <span>Audit Publication Vintages</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Right Image: From RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 48px rgba(7, 23, 43, 0.12)',
                position: 'relative',
                height: '420px',
              }}
            >
              <img
                src="/images/polar_ramp_storm.jpg"
                alt="Wind turbine engineering under heavy weather"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                backgroundColor: 'rgba(7, 23, 43, 0.9)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  FORECAST HORIZON FINDINGS
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#E2E8F0', marginTop: '4px' }}>
                  National Grid ESO models underestimated ramp slope by 840 MW at 24h lead, resolved by the 12:00 update.
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM FEATURE CARDS — DIRECTIONAL REVEALS:
          Pillar 1 from LEFT, Pillar 2 from MIDDLE, Pillar 3 from RIGHT
          ========================================================================= */}
      <section style={{ padding: '0 0 88px 0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {/* Pillar 1: From LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', background: '#F8FAFC', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0' }}
            >
              <div className="metric-icon-badge metric-icon-blue" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <Zap size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '6px' }}>
                  Lower Imbalance Bills
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Save money every month with predictable imbalance exposure and audit-grade forecast tracking.
                </p>
              </div>
            </motion.div>

            {/* Pillar 2: From MIDDLE */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', background: '#F8FAFC', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0' }}
            >
              <div className="metric-icon-badge metric-icon-green" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <Globe2 size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '6px' }}>
                  Cleaner Environment
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Reduce carbon emissions by enabling higher penetration of clean wind power on the national grid.
                </p>
              </div>
            </motion.div>

            {/* Pillar 3: From RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', background: '#F8FAFC', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0' }}
            >
              <div className="metric-icon-badge metric-icon-amber" style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
                <Sparkles size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '6px' }}>
                  Higher Grid Stability
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  A smarter investment for future asset valuation, peaker coordination, and market compliance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "READY TO POWER YOUR TOMORROW?" CAPSULE CTA BANNER
          ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: '0 0 96px 0', backgroundColor: '#FFFFFF' }}
      >
        <div className="container">
          <div style={{
            backgroundColor: 'var(--navy-deep)',
            borderRadius: '28px',
            color: '#FFFFFF',
            padding: '64px 48px',
            backgroundImage: `radial-gradient(circle at 85% 30%, rgba(37, 99, 235, 0.25) 0%, transparent 60%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(7, 23, 43, 0.18)',
          }}>
            
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--solar-amber)', textTransform: 'uppercase', marginBottom: '14px' }}>
              JOIN THE REVOLUTION
            </div>

            <h2 style={{
              fontFamily: 'var(--font-giant)',
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              lineHeight: 0.95,
              letterSpacing: '0.02em',
              marginBottom: '20px',
            }}>
              READY TO POWER<br />YOUR TOMORROW?
            </h2>

            <p style={{ fontSize: '1rem', color: '#CBD5E1', maxWidth: '620px', lineHeight: 1.6, marginBottom: '36px' }}>
              Request your customized clean energy assessment today. Discover your estimated balancing savings, vintage accuracy, and day-ahead procurement margins in minutes.
            </p>

            {/* Email form with amber pill button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (emailInput) setSubscribed(true);
              }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                maxWidth: '520px',
              }}
            >
              <input
                type="email"
                placeholder="Enter your work email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '14px 20px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn-pill-amber"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {subscribed && (
              <div style={{ marginTop: '16px', color: 'var(--solar-amber)', fontSize: '0.88rem', fontWeight: 600 }}>
                ✓ Thank you. We have received your assessment inquiry.
              </div>
            )}

          </div>
        </div>
      </motion.section>

    </div>
  );
};
