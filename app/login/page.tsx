/**
 * ============================================================================
 * Login / Register Page
 * ============================================================================
 * Combined authentication page that supports both login and registration.
 * Features role-based redirects and pre-filled demo credential hints.
 * ============================================================================
 */

'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'parent';

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: defaultRole === 'staff' ? 'STAFF' : 'PARENT',
    phone: '',
  });

  /** Handles form field changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  /** Submits the login or registration form */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegister ? 'register' : 'login',
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on role
        const role = data.user.role;
        if (role === 'PARENT') {
          router.push('/parent/dashboard');
        } else {
          router.push('/staff/dashboard');
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /** Fills demo credentials for quick login */
  const fillDemoCredentials = (type: 'parent' | 'staff') => {
    if (type === 'parent') {
      setFormData((prev) => ({
        ...prev,
        email: 'parent@example.com',
        password: 'password123',
        role: 'PARENT',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        email: 'reviewer@govschool.edu.in',
        password: 'password123',
        role: 'STAFF',
      }));
    }
  };

  return (
    <main className="landing-hero" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Back to Home */}
        <Link
          href="/"
          className="flex items-center gap-2 mb-6"
          style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}
        >
          ← Back to Home
        </Link>

        {/* Auth Card */}
        <div className="card animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="sidebar-logo-icon" style={{ width: 40, height: 40, fontSize: '1.25rem' }}>
              🎓
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>GovSchool Portal</div>
              <div className="text-xs text-muted">
                {isRegister ? 'Create your account' : 'Sign in to continue'}
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit}>
            {/* Name field (registration only) */}
            {isRegister && (
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required={isRegister}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {/* Role selector (registration only) */}
            {isRegister && (
              <div className="form-group">
                <label className="form-label" htmlFor="role">I am a</label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="PARENT">Parent / Guardian</option>
                  <option value="STAFF">Education Staff</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn ${formData.role === 'STAFF' ? 'btn-primary' : 'btn-accent'} w-full`}
              style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)' }}
              disabled={loading}
            >
              {loading ? '⏳ Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary-400)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </button>
          </div>

          {/* Demo Credentials Quick Fill */}
          {!isRegister && (
            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
              <div className="text-xs text-muted text-center mb-2" style={{ fontWeight: 600 }}>
                QUICK LOGIN — DEMO ACCOUNTS
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost w-full btn-sm"
                  onClick={() => fillDemoCredentials('parent')}
                >
                  👨‍👩‍👧 Parent Demo
                </button>
                <button
                  type="button"
                  className="btn btn-ghost w-full btn-sm"
                  onClick={() => fillDemoCredentials('staff')}
                >
                  🏫 Staff Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="landing-hero" style={{ minHeight: '100vh' }} />}>
      <LoginPageContent />
    </Suspense>
  );
}
