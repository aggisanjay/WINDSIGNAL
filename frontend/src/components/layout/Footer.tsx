import React from 'react';
import { Link } from 'react-router-dom';
import { SunMedium, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--navy-deep)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#CBD5E1',
      padding: '72px 0 32px 0',
    }}>
      <div className="container">
        
        {/* Main 5-Column Grid matching reference */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '56px',
        }}>
          
          {/* Col 1: Brand & Mission */}
          <div style={{ maxWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <SunMedium size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                WINDSIGNAL
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px' }}>
              Pioneering the transition to independent, resilient clean energy for homes, enterprises, and utility procurement desks across the UK.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', border: '1px solid #334155', borderRadius: '4px', padding: '3px 8px' }}>
                ISO 14001 Compliant
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748B', border: '1px solid #334155', borderRadius: '4px', padding: '3px 8px' }}>
                Elexon BMRS Verified
              </span>
            </div>
          </div>

          {/* Col 2: SOLUTIONS */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: '20px' }}>
              SOLUTIONS
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <li><Link to="/forecast" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Utility Wind Procurement</Link></li>
              <li><Link to="/accuracy" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Commercial & Industrial</Link></li>
              <li><Link to="/forecast" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Battery Energy Storage</Link></li>
              <li><Link to="/status" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>EV Infrastructure</Link></li>
              <li><Link to="/publications" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Microgrid Systems</Link></li>
            </ul>
          </div>

          {/* Col 3: PRODUCTS & TECH */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: '20px' }}>
              PRODUCTS & TECH
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <li><Link to="/forecast" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Forecast Intelligence</Link></li>
              <li><Link to="/publications" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Publication Vintages</Link></li>
              <li><Link to="/accuracy" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Energy Risk Profiler</Link></li>
              <li><Link to="/methodology" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Elexon Streaming APIs</Link></li>
              <li><Link to="/status" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Telemetry Monitor</Link></li>
            </ul>
          </div>

          {/* Col 4: COMPANY */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: '20px' }}>
              COMPANY
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <li><Link to="/methodology" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>About Us</Link></li>
              <li><Link to="/accuracy" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Sustainability Report</Link></li>
              <li><Link to="/methodology" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Careers & Research</Link></li>
              <li><Link to="/publications" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Press & Media</Link></li>
              <li><Link to="/status" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Investor Relations</Link></li>
            </ul>
          </div>

          {/* Col 5: SUPPORT */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: '20px' }}>
              SUPPORT
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <li><Link to="/status" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Customer Portal</Link></li>
              <li><Link to="/accuracy" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Balancing Calculator</Link></li>
              <li><Link to="/methodology" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>FAQs & Knowledge Base</Link></li>
              <li><Link to="/methodology" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Data Governance</Link></li>
              <li><Link to="/status" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Contact Engineering</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar matching reference */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.78rem',
          color: '#64748B',
        }}>
          <div>
            © 2026 WindSignal Clean Energy Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/methodology" style={{ color: '#64748B' }}>Privacy Policy</Link>
            <Link to="/methodology" style={{ color: '#64748B' }}>Terms of Service</Link>
            <Link to="/methodology" style={{ color: '#64748B' }}>Energy Disclosures</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="var(--solar-amber)" />
            <span>Built with AI assistance in accordance with assessment disclosure guidelines.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
