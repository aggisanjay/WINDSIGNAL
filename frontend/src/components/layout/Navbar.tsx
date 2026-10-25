import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const { data: status } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: api.getStatus,
    refetchInterval: 30000,
  });

  const isUpstreamHealthy = status?.upstreamElexon?.reachable;
  const latency = status?.upstreamElexon?.latency_ms;

  const navLinks = [
    { to: '/', label: 'Overview' },
    { to: '/forecast', label: 'Day-Ahead Forecast' },
    { to: '/accuracy', label: 'Accuracy & Risk' },
    { to: '/publications', label: 'Vintage Curves' },
    { to: '/methodology', label: 'Methodology' },
    { to: '/status', label: 'System Health' },
  ];

  // Permanent deep dark navy navbar background - never transparent or white
  const navBg = '#07172B';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: navBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        transition: 'all 0.25s ease',
        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.45)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
          flexWrap: 'nowrap',
        }}
      >
        
        {/* Brand Logo - Sunnova Clean Energy Style */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          {/* Custom Sunnova-style Sunburst Wind Icon */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4.2" fill="#07172B" />
              <line x1="12" y1="2" x2="12" y2="4.5" stroke="#07172B" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="12" y1="19.5" x2="12" y2="22" stroke="#07172B" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="2" y1="12" x2="4.5" y2="12" stroke="#07172B" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="19.5" y1="12" x2="22" y2="12" stroke="#07172B" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" stroke="#07172B" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" stroke="#07172B" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" stroke="#07172B" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" stroke="#07172B" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              WINDSIGNAL
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                color: '#F59E0B',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginTop: '3px',
              }}
            >
              UK FORECAST INTELLIGENCE
            </span>
          </div>
        </Link>

        {/* Center Navigation Links - Non-wrapping with subtle bottom indicator */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '22px',
            flexWrap: 'nowrap',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                padding: '6px 2px',
                position: 'relative',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              })}
            >
              {({ isActive }) => (
                <>
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '0',
                        right: '0',
                        height: '2.5px',
                        backgroundColor: '#F59E0B',
                        borderRadius: '2px',
                        boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Items: Telemetry + Search + Solar Amber Pill Button (No White) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          
          {/* Compact Telemetry Pill */}
          <Link
            to="/status"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#F1F5F9',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
            title="Real-time Elexon API Connectivity"
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isUpstreamHealthy ? '#10B981' : '#F59E0B',
                boxShadow: isUpstreamHealthy ? '0 0 6px #10B981' : 'none',
                display: 'inline-block',
              }}
            />
            <span>{isUpstreamHealthy ? `BMRS ${Math.round(latency || 280)}ms` : 'Syncing'}</span>
          </Link>

          {/* Search Trigger */}
          <Link
            to="/forecast"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              transition: 'background-color 0.2s ease',
              flexShrink: 0,
            }}
            title="Search Jan 2026 Forecasts"
          >
            <Search size={15} />
          </Link>

          {/* Solar Amber Pill Button - Warm Clean-Energy Glow, No White */}
          <Link
            to="/forecast"
            className="btn-pill-amber"
            style={{
              padding: '10px 22px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#07172B',
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)',
              borderRadius: '9999px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              minWidth: 'max-content',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>Explore Jan 2026</span>
            <ArrowRight size={15} style={{ flexShrink: 0 }} />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', color: '#FFFFFF', padding: '6px' }}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#07172B',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                fontSize: '1.05rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#F59E0B' : '#E2E8F0',
                padding: '8px 0',
                textDecoration: 'none',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1080px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};


