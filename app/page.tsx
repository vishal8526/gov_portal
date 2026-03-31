/**
 * ============================================================================
 * Landing Page — GovSchool Portal
 * ============================================================================
 * Premium hero section with animated gradients, feature highlights, and
 * dual CTA buttons for Parent and Staff login. This is the first page
 * visitors see and sets the visual tone for the entire application.
 * ============================================================================
 */

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main>
      {/* ================================================================
          Hero Section — Animated gradient background with floating orbs
          ================================================================ */}
      <section className="landing-hero">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
            <div className="sidebar-logo-icon" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>
              🎓
            </div>
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              GovSchool Portal
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="hero-title animate-fade-in-up">
            Empowering Education <span className="text-gradient">for Every Child</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle animate-fade-in-up stagger-2">
            A unified platform for government school admissions and scholarships. 
            Parents can apply seamlessly, while education staff efficiently review, 
            approve, and manage applications with complete transparency.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions animate-fade-in-up stagger-3">
            <Link href="/login?role=parent" className="btn btn-accent btn-lg">
              👨‍👩‍👧 Parent Portal
            </Link>
            <Link href="/login?role=staff" className="btn btn-primary btn-lg">
              🏫 Staff Dashboard
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-6 animate-fade-in stagger-4" 
               style={{ opacity: 0.6 }}>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span className="text-sm text-secondary">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span className="text-sm text-secondary">Mobile Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span className="text-sm text-secondary">Real-time Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Feature Grid — Key capabilities of the platform
          ================================================================ */}
      <section className="feature-grid">
        <div className="feature-card animate-fade-in-up stagger-1">
          <div className="feature-icon">📝</div>
          <h3 className="feature-title">Easy Application</h3>
          <p className="feature-desc">
            Submit admission or scholarship applications with a guided multi-step form. 
            Real-time validation ensures your application is complete and accurate.
          </p>
        </div>

        <div className="feature-card animate-fade-in-up stagger-2">
          <div className="feature-icon">🎯</div>
          <h3 className="feature-title">Smart Eligibility</h3>
          <p className="feature-desc">
            Automatic eligibility pre-checks for scholarships based on income, grades, 
            and category. Know your chances before you apply.
          </p>
        </div>

        <div className="feature-card animate-fade-in-up stagger-3">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Live Status Tracking</h3>
          <p className="feature-desc">
            Track your application status in real-time. Get instant notifications 
            when your application moves through the review process.
          </p>
        </div>

        <div className="feature-card animate-fade-in-up stagger-4">
          <div className="feature-icon">👥</div>
          <h3 className="feature-title">Staff Review Queue</h3>
          <p className="feature-desc">
            Prioritized review queue with filtering and sorting. Staff can efficiently 
            process applications with internal notes and audit trails.
          </p>
        </div>

        <div className="feature-card animate-fade-in-up stagger-5">
          <div className="feature-icon">💺</div>
          <h3 className="feature-title">Seat Management</h3>
          <p className="feature-desc">
            Grade-wise seat allocation with real-time capacity tracking. Automated 
            checks prevent over-allocation and ensure fair distribution.
          </p>
        </div>

        <div className="feature-card animate-fade-in-up stagger-1">
          <div className="feature-icon">📋</div>
          <h3 className="feature-title">Full Audit Trail</h3>
          <p className="feature-desc">
            Every action is logged with timestamps and user attribution. Complete 
            transparency and accountability for all stakeholders.
          </p>
        </div>
      </section>

      {/* ================================================================
          Demo Credentials Section
          ================================================================ */}
      <section style={{ 
        maxWidth: '600px', 
        margin: '0 auto var(--space-16)', 
        padding: '0 var(--space-6)',
        position: 'relative',
        zIndex: 1,
        contentVisibility: 'auto',
        containIntrinsicSize: '300px'
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>
            🔑 Demo Credentials
          </h3>
          <p className="text-sm text-secondary mb-4">
            Use any of these accounts to explore the portal:
          </p>
          <div className="grid-2" style={{ gap: 'var(--space-3)', textAlign: 'left' }}>
            <div style={{ 
              padding: 'var(--space-3)', 
              background: 'var(--bg-glass)', 
              borderRadius: 'var(--border-radius-md)' 
            }}>
              <div className="text-xs text-muted font-semibold">PARENT ACCOUNT</div>
              <div className="text-sm" style={{ marginTop: 4 }}>parent@example.com</div>
              <div className="text-xs text-muted">password123</div>
            </div>
            <div style={{ 
              padding: 'var(--space-3)', 
              background: 'var(--bg-glass)', 
              borderRadius: 'var(--border-radius-md)' 
            }}>
              <div className="text-xs text-muted font-semibold">STAFF ACCOUNT</div>
              <div className="text-sm" style={{ marginTop: 4 }}>reviewer@govschool.edu.in</div>
              <div className="text-xs text-muted">password123</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: 'var(--space-6)', 
        borderTop: '1px solid var(--border-default)',
        position: 'relative',
        zIndex: 1,
        contentVisibility: 'auto',
        containIntrinsicSize: '120px'
      }}>
        <p className="text-sm text-muted">
          © 2025 GovSchool Portal — Government School Admission & Scholarship Management System
        </p>
      </footer>
    </main>
  );
}
