/**
 * ============================================================================
 * Parent Dashboard — Application overview and status tracking
 * ============================================================================
 * Shows all submitted applications with status badges, links to detail views,
 * and quick action buttons for new applications.
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatStatus, getStatusColor, timeAgo } from '@/lib/utils';

interface Application {
  id: string;
  type: string;
  status: string;
  studentName: string;
  gradeApplying: number;
  priorityScore: number;
  createdAt: string;
  submittedAt: string;
  reviewedAt: string | null;
  scholarshipDetail?: {
    scholarshipType: string;
    eligible: boolean;
  };
  seatAssignment?: {
    status: string;
    allocation: { grade: number };
  };
}

export default function ParentDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((data) => {
        setApplications(data.applications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute summary stats from applications
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length,
    approved: applications.filter((a) => a.status === 'APPROVED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div>
        <div className="page-title-section">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
        </div>
        <div className="grid-stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-card"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-title-section">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">Track your admission and scholarship applications</p>
      </div>

      {/* Quick Stats */}
      <div className="grid-stats mb-6">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card stat-card-error">
          <div className="stat-icon">❌</div>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link href="/parent/apply/admission" className="btn btn-accent">
          📝 New Admission Application
        </Link>
        <Link href="/parent/apply/scholarship" className="btn btn-primary">
          🎓 New Scholarship Application
        </Link>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">No Applications Yet</div>
          <p className="text-sm text-muted mb-4">
            Start by submitting an admission or scholarship application for your child.
          </p>
          <Link href="/parent/apply/admission" className="btn btn-accent">
            Submit First Application →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app, index) => (
            <Link
              key={app.id}
              href={`/parent/application/${app.id}`}
              className={`card card-interactive animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: '1.1em' }}>
                      {app.type === 'ADMISSION' ? '🏫' : '🎓'}
                    </span>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
                      {app.studentName}
                    </h3>
                    <span className={`badge ${getStatusColor(app.status)}`}>
                      {formatStatus(app.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-secondary">
                    <span>Grade {app.gradeApplying}</span>
                    <span>•</span>
                    <span>{app.type === 'ADMISSION' ? 'Admission' : 'Scholarship'}</span>
                    {app.scholarshipDetail && (
                      <>
                        <span>•</span>
                        <span>
                          {app.scholarshipDetail.scholarshipType.replace('_', ' ')}
                          {app.scholarshipDetail.eligible ? ' ✅' : ' ⚠️'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted">
                    Submitted {timeAgo(app.submittedAt)}
                  </div>
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                    ID: {app.id.slice(0, 8).toUpperCase()}
                  </div>
                  {app.seatAssignment && (
                    <div className="badge badge-approved mt-1" style={{ fontSize: '10px' }}>
                      Seat Assigned
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
