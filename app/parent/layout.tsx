/**
 * ============================================================================
 * Parent Layout — Sidebar navigation for parent portal
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check authentication
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated || data.user.role === 'STAFF' || data.user.role === 'ADMIN') {
          router.push('/login?role=parent');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));

    // Fetch notification count
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>🎓</div>
          <div className="skeleton skeleton-text" style={{ width: 200 }}></div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/parent/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/parent/apply/admission', icon: '📝', label: 'Apply — Admission' },
    { href: '/parent/apply/scholarship', icon: '🎓', label: 'Apply — Scholarship' },
    { href: '/parent/notifications', icon: '🔔', label: 'Notifications', badge: unreadCount },
  ];

  return (
    <div className="page-container">
      {/* Mobile sidebar toggle */}
      <button
        className="btn btn-icon btn-ghost"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 60,
          display: 'none',
        }}
        id="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <div>
            <div className="sidebar-logo-text">GovSchool</div>
            <div className="sidebar-logo-sub">Parent Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Navigation</div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-link-icon">{link.icon}</span>
                <span>{link.label}</span>
                {link.badge ? <span className="nav-link-badge">{link.badge}</span> : null}
              </Link>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div className="avatar">{user.name.charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs text-muted truncate">{user.email}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost w-full btn-sm mt-2"
            onClick={handleLogout}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-header">
          <div>
            <button
              className="btn btn-icon btn-ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ marginRight: 'var(--space-3)' }}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/parent/notifications" className="notification-bell">
              🔔
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </Link>
          </div>
        </header>
        <div className="page-body">{children}</div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
