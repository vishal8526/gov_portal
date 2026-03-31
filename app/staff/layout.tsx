/**
 * ============================================================================
 * Staff Layout — Sidebar navigation for education staff portal
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated || data.user.role === 'PARENT') {
          router.push('/login?role=staff');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));

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
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>🏫</div>
          <div className="skeleton skeleton-text" style={{ width: 200 }}></div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/staff/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/staff/review', icon: '📋', label: 'Review Queue' },
    { href: '/staff/seats', icon: '💺', label: 'Seat Management' },
    { href: '/staff/reports', icon: '📈', label: 'Reports' },
  ];

  return (
    <div className="page-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))' }}>🏫</div>
          <div>
            <div className="sidebar-logo-text">GovSchool</div>
            <div className="sidebar-logo-sub">Staff Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Management</div>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`nav-link ${pathname === link.href || pathname.startsWith(link.href + '/') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span className="nav-link-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))' }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs text-muted truncate">{user.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost w-full btn-sm mt-2" onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <button className="btn btn-icon btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">☰</button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary">{user.name}</span>
            <div className="notification-bell" onClick={() => router.push('/staff/review')}>
              🔔
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </div>
          </div>
        </header>
        <div className="page-body">{children}</div>
      </div>

      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
