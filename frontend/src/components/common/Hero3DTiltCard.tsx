import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Zap, ShieldCheck, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Hero3DTiltCardProps {
  peakMW?: number;
  totalGWh?: number;
  maeMW?: number;
}

export const Hero3DTiltCard: React.FC<Hero3DTiltCardProps> = ({
  peakMW = 16420,
  totalGWh = 6480,
  maeMW = 1110,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for normalized cursor coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for fluid movement
  const mouseXSpring = useSpring(x, { stiffness: 240, damping: 24 });
  const mouseYSpring = useSpring(y, { stiffness: 240, damping: 24 });

  // 3D rotations based on spring values
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-14deg', '14deg']);

  // Specular sheen highlight opacity and position
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const xPct = clientX / rect.width - 0.5;
    const yPct = clientY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{
        perspective: '1200px',
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
      }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          borderRadius: '22px',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.90) 0%, rgba(7, 23, 43, 0.96) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 35px rgba(245, 158, 11, 0.15)',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Dynamic Specular Sheen Glow */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* 3D Content Layers */}
        <div style={{ position: 'relative', zIndex: 2, transformStyle: 'preserve-3d' }}>
          
          {/* Card Top Header Layer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              transform: 'translateZ(25px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={18} color="#F59E0B" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F59E0B' }}>
                  REAL-TIME TELEMETRY
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  UK Wind Generation Terminal
                </div>
              </div>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34D399',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              Live BMRS
            </span>
          </div>

          {/* Card Middle Image with 3D Depth */}
          <div
            style={{
              position: 'relative',
              borderRadius: '14px',
              overflow: 'hidden',
              height: '145px',
              marginBottom: '16px',
              transform: 'translateZ(40px)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <img
              src="/images/commercial_clean_energy.jpg"
              alt="Clean energy infrastructure"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(7, 23, 43, 0.9) 100%)',
              }}
            />

            {/* Overlaid 3D Stat Tag */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '14px',
                right: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <div style={{ fontSize: '0.68rem', color: '#CBD5E1', fontWeight: 600 }}>JANUARY 2026 PEAK OUTTURN</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                  {peakMW.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#F59E0B' }}>MW</span>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#10B981',
                  background: 'rgba(7, 23, 43, 0.8)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                99.8% Observed
              </div>
            </div>
          </div>

          {/* Card Bottom 3D Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              transform: 'translateZ(50px)',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <TrendingDown size={14} color="#60A5FA" />
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Month MAE
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                {maeMW.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>MW</span>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <ShieldCheck size={14} color="#34D399" />
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Clean Delivered
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                {totalGWh.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>GWh</span>
              </div>
            </div>
          </div>

          {/* Interactive Action Link */}
          <div style={{ marginTop: '16px', transform: 'translateZ(30px)' }}>
            <Link
              to="/forecast"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.14)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#FBBF24',
                fontWeight: 700,
                fontSize: '0.84rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Explore Day-Ahead Predictions</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
