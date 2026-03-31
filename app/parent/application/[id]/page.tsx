/**
 * ============================================================================
 * Application Detail Page — Parent View
 * ============================================================================
 * Shows full application details, status timeline, and seat assignment info.
 * Parents can track the progress of their application through the review process.
 * ============================================================================
 */

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { formatDate, formatStatus, getStatusColor, formatCurrency } from '@/lib/utils';

interface AuditLog {
  id: string;
  action: string;
  description: string | null;
  createdAt: string;
  changedBy: { name: string };
}

interface ApplicationDetail {
  id: string;
  type: string;
  status: string;
  priorityScore: number;
  studentName: string;
  studentDob: string;
  studentGender: string;
  gradeApplying: number;
  previousSchool: string | null;
  previousGradePct: number | null;
  address: string;
  phone: string;
  familyIncome: number | null;
  submittedAt: string;
  reviewedAt: string | null;
  scholarshipDetail?: {
    scholarshipType: string;
    category: string | null;
    achievements: string | null;
    eligible: boolean;
    eligibilityNotes: string | null;
    bplCertificate: boolean;
    incomeCertificate: boolean;
  };
  seatAssignment?: {
    status: string;
    assignedAt: string;
    allocation: { grade: number; totalSeats: number };
    assignedBy: { name: string };
  };
  auditLogs: AuditLog[];
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setApp(data.application);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="page-body"><div className="skeleton skeleton-card" style={{ height: 400 }}></div></div>;
  }

  if (!app) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Application Not Found</div>
        <Link href="/parent/dashboard" className="btn btn-primary mt-4">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <Link href="/parent/dashboard" className="text-sm text-secondary mb-2" style={{ display: 'inline-block' }}>
            ← Back to Dashboard
          </Link>
          <h1 className="page-title flex items-center gap-3">
            {app.type === 'ADMISSION' ? '🏫' : '🎓'} {app.studentName}
            <span className={`badge ${getStatusColor(app.status)}`} style={{ fontSize: 'var(--text-sm)' }}>
              {formatStatus(app.status)}
            </span>
          </h1>
          <p className="page-subtitle">Application ID: {app.id.slice(0, 8).toUpperCase()} • {app.type === 'ADMISSION' ? 'Admission' : 'Scholarship'} • Grade {app.gradeApplying}</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Column — Details */}
        <div className="flex flex-col gap-4">
          {/* Student Info Card */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">👤 Student Information</h3></div>
            <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
              <div><div className="text-xs text-muted">Full Name</div><div className="text-sm font-semibold">{app.studentName}</div></div>
              <div><div className="text-xs text-muted">Date of Birth</div><div className="text-sm font-semibold">{formatDate(app.studentDob)}</div></div>
              <div><div className="text-xs text-muted">Gender</div><div className="text-sm font-semibold">{app.studentGender}</div></div>
              <div><div className="text-xs text-muted">Grade Applying</div><div className="text-sm font-semibold">Grade {app.gradeApplying}</div></div>
              <div><div className="text-xs text-muted">Previous School</div><div className="text-sm font-semibold">{app.previousSchool || 'N/A'}</div></div>
              <div><div className="text-xs text-muted">Previous Grade</div><div className="text-sm font-semibold">{app.previousGradePct ? `${app.previousGradePct}%` : 'N/A'}</div></div>
              <div><div className="text-xs text-muted">Address</div><div className="text-sm">{app.address}</div></div>
              <div><div className="text-xs text-muted">Phone</div><div className="text-sm font-semibold">{app.phone}</div></div>
              {app.familyIncome && (
                <div><div className="text-xs text-muted">Family Income</div><div className="text-sm font-semibold">{formatCurrency(app.familyIncome)}</div></div>
              )}
            </div>
          </div>

          {/* Scholarship Details */}
          {app.scholarshipDetail && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🎓 Scholarship Details</h3>
                <span className={`badge ${app.scholarshipDetail.eligible ? 'badge-approved' : 'badge-rejected'}`}>
                  {app.scholarshipDetail.eligible ? 'Eligible' : 'Review Needed'}
                </span>
              </div>
              <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
                <div><div className="text-xs text-muted">Type</div><div className="text-sm font-semibold">{app.scholarshipDetail.scholarshipType.replace('_', ' ')}</div></div>
                <div><div className="text-xs text-muted">Category</div><div className="text-sm font-semibold">{app.scholarshipDetail.category || 'General'}</div></div>
                <div><div className="text-xs text-muted">BPL Certificate</div><div className="text-sm">{app.scholarshipDetail.bplCertificate ? '✅ Provided' : '❌ Not provided'}</div></div>
                <div><div className="text-xs text-muted">Income Certificate</div><div className="text-sm">{app.scholarshipDetail.incomeCertificate ? '✅ Provided' : '❌ Not provided'}</div></div>
              </div>
              {app.scholarshipDetail.eligibilityNotes && (
                <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-glass)', borderRadius: 'var(--border-radius-md)' }}>
                  <div className="text-xs text-muted mb-1">Eligibility Assessment</div>
                  {app.scholarshipDetail.eligibilityNotes.split(' | ').map((note, i) => (
                    <div key={i} className="text-sm text-secondary" style={{ marginTop: 2 }}>• {note}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Seat Assignment */}
          {app.seatAssignment && (
            <div className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <h3 className="card-title mb-2">💺 Seat Assignment</h3>
              <div className="alert alert-success">
                <span>🎉</span>
                <div>
                  Seat confirmed in Grade {app.seatAssignment.allocation.grade} • 
                  Assigned by {app.seatAssignment.assignedBy.name} on {formatDate(app.seatAssignment.assignedAt)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Timeline */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">📋 Application Timeline</h3></div>
          <div className="timeline">
            {app.auditLogs.map((log) => (
              <div key={log.id} className="timeline-item">
                <div className={`timeline-dot ${
                  log.action === 'STATUS_CHANGED' && log.description?.includes('APPROVED') ? 'success' :
                  log.action === 'STATUS_CHANGED' && log.description?.includes('REJECTED') ? 'error' :
                  log.action === 'SEAT_ALLOCATED' ? 'success' : ''
                }`}></div>
                <div className="timeline-content">
                  <div className="timeline-date">{formatDate(log.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="timeline-action">{log.action.replace(/_/g, ' ')}</div>
                  {log.description && <div className="timeline-description">{log.description}</div>}
                </div>
              </div>
            ))}
            {app.auditLogs.length === 0 && (
              <p className="text-sm text-muted">No timeline events yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
