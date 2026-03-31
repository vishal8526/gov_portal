/**
 * ============================================================================
 * Parent Notifications Page
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { timeAgo } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  application?: { id: string; studentName: string; type: string };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => { setNotifications(data.notifications || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const typeColors: Record<string, string> = {
    SUCCESS: 'alert-success', ERROR: 'alert-error', WARNING: 'alert-warning', INFO: 'alert-info',
  };

  const typeIcons: Record<string, string> = {
    SUCCESS: '✅', ERROR: '❌', WARNING: '⚠️', INFO: 'ℹ️',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">🔔 Notifications</h1>
          <p className="page-subtitle">{notifications.filter((n) => !n.isRead).length} unread notifications</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
          Mark All Read
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card" style={{ height: 80 }}></div>)}</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🔔</div><div className="empty-state-title">No Notifications</div></div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div key={n.id} className={`alert ${typeColors[n.type] || 'alert-info'}`} style={{ opacity: n.isRead ? 0.6 : 1 }}>
              <span>{typeIcons[n.type] || 'ℹ️'}</span>
              <div style={{ flex: 1 }}>
                <div className="font-semibold">{n.title}</div>
                <div style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>{n.message}</div>
                <div className="text-xs text-muted mt-1">{timeAgo(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
