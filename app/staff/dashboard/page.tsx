/**
 * ============================================================================
 * Staff Dashboard — Analytics overview with stats, charts, and activity feed
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatStatus, timeAgo } from '@/lib/utils';

interface DashboardData {
  stats: {
    totalApplications: number;
    todayCount: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    pendingReview: number;
    approvalRate: number;
    recentApplications: Array<{
      id: string;
      studentName: string;
      type: string;
      status: string;
      createdAt: string;
      parent: { name: string };
    }>;
  };
  seatSummary: {
    totalSeats: number;
    allocatedSeats: number;
    availableSeats: number;
    utilizationPct: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    description: string | null;
    createdAt: string;
    changedBy: { name: string };
    application?: { studentName: string; type: string };
  }>;
}

export default function StaffDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <div className="skeleton skeleton-title mb-6"></div>
        <div className="grid-stats">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton skeleton-card" style={{ height: 100 }}></div>)}</div>
      </div>
    );
  }

  const { stats, seatSummary, recentActivity } = data;

  return (
    <div>
      <div className="page-title-section">
        <h1 className="page-title">📊 Staff Dashboard</h1>
        <p className="page-subtitle">Application overview and management metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid-stats mb-6">
        <div className="stat-card stat-card-primary animate-fade-in-up stagger-1">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.totalApplications}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card stat-card-warning animate-fade-in-up stagger-2">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pendingReview}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card stat-card-success animate-fade-in-up stagger-3">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.approvalRate}%</div>
          <div className="stat-label">Approval Rate</div>
        </div>
        <div className="stat-card stat-card-info animate-fade-in-up stagger-4">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.todayCount}</div>
          <div className="stat-label">Today&apos;s Applications</div>
        </div>
        <div className="stat-card stat-card-error animate-fade-in-up stagger-5">
          <div className="stat-icon">💺</div>
          <div className="stat-value">{seatSummary.utilizationPct}%</div>
          <div className="stat-label">Seat Utilization</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link href="/staff/review" className="btn btn-primary">📋 Review Queue ({stats.pendingReview})</Link>
        <Link href="/staff/seats" className="btn btn-accent">💺 Manage Seats ({seatSummary.availableSeats} available)</Link>
        <Link href="/staff/review?status=SUBMITTED" className="btn btn-warning">⏳ New Submissions ({stats.byStatus['SUBMITTED'] || 0})</Link>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Status Breakdown */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Application Status Breakdown</h3></div>
          <div className="flex flex-col gap-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge badge-${status.toLowerCase() === 'under_review' ? 'review' : status.toLowerCase()}`}>
                    {formatStatus(status)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="progress-bar" style={{ width: 100 }}>
                    <div className="progress-fill" style={{ width: `${stats.totalApplications > 0 ? (count / stats.totalApplications) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-sm font-semibold" style={{ minWidth: 30, textAlign: 'right' }}>{count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Type breakdown */}
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
            <div className="text-xs text-muted font-semibold mb-2">BY TYPE</div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span>🏫</span>
                <span className="text-sm">Admissions: <strong>{stats.byType['ADMISSION'] || 0}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎓</span>
                <span className="text-sm">Scholarships: <strong>{stats.byType['SCHOLARSHIP'] || 0}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">🕐 Recent Activity</h3></div>
          <div className="flex flex-col gap-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted">No recent activity.</p>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3" style={{ paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-default)' }}>
                  <div className="avatar avatar-sm">{act.changedBy.name.charAt(0)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm">
                      <span className="font-semibold">{act.changedBy.name}</span>
                      <span className="text-secondary"> — {act.action.replace(/_/g, ' ')}</span>
                    </div>
                    {act.description && (
                      <div className="text-xs text-muted truncate" style={{ maxWidth: 300 }}>{act.description}</div>
                    )}
                    <div className="text-xs text-muted mt-1">{timeAgo(act.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Seat Utilization */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">💺 Seat Utilization Summary</h3>
          <Link href="/staff/seats" className="btn btn-ghost btn-sm">Manage →</Link>
        </div>
        <div className="grid-3" style={{ gap: 'var(--space-4)' }}>
          <div className="text-center">
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{seatSummary.totalSeats}</div>
            <div className="stat-label">Total Seats</div>
          </div>
          <div className="text-center">
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-accent-400)' }}>{seatSummary.allocatedSeats}</div>
            <div className="stat-label">Allocated</div>
          </div>
          <div className="text-center">
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-primary-400)' }}>{seatSummary.availableSeats}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="progress-bar mt-4" style={{ height: 12 }}>
          <div className="progress-fill" style={{ width: `${seatSummary.utilizationPct}%` }}></div>
        </div>
        <div className="text-xs text-muted text-center mt-2">{seatSummary.utilizationPct}% seats utilized</div>
      </div>
    </div>
  );
}
