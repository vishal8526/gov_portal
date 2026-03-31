/**
 * ============================================================================
 * Staff Application Review Detail — Full review with actions and notes
 * ============================================================================
 * The primary staff workspace for reviewing individual applications.
 * Features: status updates, internal notes, seat assignment, and audit trail.
 * ============================================================================
 */

'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { formatDate, formatStatus, getStatusColor, formatCurrency, timeAgo } from '@/lib/utils';

interface StaffNote { id: string; content: string; isInternal: boolean; createdAt: string; staff: { name: string }; }
interface AuditLog { id: string; action: string; description: string | null; createdAt: string; changedBy: { name: string }; }

interface ApplicationDetail {
  id: string; type: string; status: string; priorityScore: number;
  studentName: string; studentDob: string; studentGender: string;
  gradeApplying: number; previousSchool: string | null; previousGradePct: number | null;
  address: string; phone: string; familyIncome: number | null;
  submittedAt: string; reviewedAt: string | null;
  parent: { id: string; name: string; email: string; phone: string | null };
  assignedReviewer?: { id: string; name: string } | null;
  scholarshipDetail?: {
    scholarshipType: string; category: string | null; achievements: string | null;
    eligible: boolean; eligibilityNotes: string | null;
    bplCertificate: boolean; incomeCertificate: boolean;
  };
  seatAssignment?: { id: string; status: string; assignedAt: string; allocation: { grade: number; totalSeats: number }; assignedBy: { name: string }; };
  staffNotes: StaffNote[];
  auditLogs: AuditLog[];
}

export default function StaffReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchApp = useCallback(() => {
    fetch(`/api/applications/${id}`)
      .then((r) => r.json())
      .then((data) => { setApp(data.application); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchApp(); }, [id, fetchApp]);

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status_update', status: newStatus, note: statusNote }),
      });
      const data = await res.json();
      if (data.success) { setSuccess(`Status updated to ${formatStatus(newStatus)}`); setStatusNote(''); fetchApp(); }
      else setError(data.error);
    } catch { setError('Failed to update status'); }
    setActionLoading(false);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_note', content: noteText, isInternal: true }),
      });
      const data = await res.json();
      if (data.success) { setNoteText(''); fetchApp(); }
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleAssignSeat = async () => {
    setActionLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_seat' }),
      });
      const data = await res.json();
      if (data.success) { setSuccess('Seat assigned successfully!'); fetchApp(); }
      else setError(data.error);
    } catch { setError('Failed to assign seat'); }
    setActionLoading(false);
  };

  if (loading) return <div className="skeleton skeleton-card" style={{ height: 600 }}></div>;
  if (!app) return <div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">Application Not Found</div></div>;

  const statusActions: Record<string, { label: string; actions: { status: string; label: string; className: string }[] }> = {
    SUBMITTED: { label: 'New Submission', actions: [
      { status: 'UNDER_REVIEW', label: '📋 Start Review', className: 'btn-primary' },
      { status: 'REJECTED', label: '❌ Reject', className: 'btn-danger' },
    ]},
    UNDER_REVIEW: { label: 'Under Review', actions: [
      { status: 'APPROVED', label: '✅ Approve', className: 'btn-accent' },
      { status: 'REJECTED', label: '❌ Reject', className: 'btn-danger' },
      { status: 'WAITLISTED', label: '⏳ Waitlist', className: 'btn-warning' },
    ]},
    WAITLISTED: { label: 'Waitlisted', actions: [
      { status: 'APPROVED', label: '✅ Approve', className: 'btn-accent' },
      { status: 'REJECTED', label: '❌ Reject', className: 'btn-danger' },
    ]},
    APPROVED: { label: 'Approved', actions: [] },
    REJECTED: { label: 'Rejected', actions: [
      { status: 'UNDER_REVIEW', label: '🔄 Re-Review', className: 'btn-primary' },
    ]},
  };

  const currentActions = statusActions[app.status] || { label: '', actions: [] };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <Link href="/staff/review" className="text-sm text-secondary mb-2" style={{ display: 'inline-block' }}>← Back to Queue</Link>
          <h1 className="page-title flex items-center gap-3">
            {app.type === 'ADMISSION' ? '🏫' : '🎓'} {app.studentName}
            <span className={`badge ${getStatusColor(app.status)}`} style={{ fontSize: 'var(--text-sm)' }}>{formatStatus(app.status)}</span>
          </h1>
          <p className="page-subtitle">
            ID: {app.id.slice(0, 8).toUpperCase()} • Grade {app.gradeApplying} • Priority: {app.priorityScore}/100 • Parent: {app.parent.name}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}
      {success && <div className="alert alert-success mb-4">✅ {success}</div>}

      <div className="grid-2" style={{ alignItems: 'start', gridTemplateColumns: '2fr 1fr' }}>
        {/* Main Content */}
        <div className="flex flex-col gap-4">
          {/* Student Info */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">👤 Student & Parent Information</h3></div>
            <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
              <div><div className="text-xs text-muted">Student</div><div className="text-sm font-semibold">{app.studentName}</div></div>
              <div><div className="text-xs text-muted">DOB</div><div className="text-sm font-semibold">{formatDate(app.studentDob)}</div></div>
              <div><div className="text-xs text-muted">Gender</div><div className="text-sm font-semibold">{app.studentGender}</div></div>
              <div><div className="text-xs text-muted">Grade</div><div className="text-sm font-semibold">{app.gradeApplying}</div></div>
              <div><div className="text-xs text-muted">Previous School</div><div className="text-sm">{app.previousSchool || 'N/A'}</div></div>
              <div><div className="text-xs text-muted">Previous Grade</div><div className="text-sm font-semibold">{app.previousGradePct ? `${app.previousGradePct}%` : 'N/A'}</div></div>
              <div><div className="text-xs text-muted">Parent</div><div className="text-sm font-semibold">{app.parent.name}</div><div className="text-xs text-muted">{app.parent.email}</div></div>
              <div><div className="text-xs text-muted">Phone</div><div className="text-sm font-semibold">{app.phone}</div></div>
              <div><div className="text-xs text-muted">Income</div><div className="text-sm font-semibold">{app.familyIncome ? formatCurrency(app.familyIncome) : 'Not provided'}</div></div>
              <div><div className="text-xs text-muted">Address</div><div className="text-sm">{app.address}</div></div>
            </div>
          </div>

          {/* Scholarship Details */}
          {app.scholarshipDetail && (
            <div className="card" style={{ borderColor: app.scholarshipDetail.eligible ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}>
              <div className="card-header">
                <h3 className="card-title">🎓 Scholarship Assessment</h3>
                <span className={`badge ${app.scholarshipDetail.eligible ? 'badge-approved' : 'badge-rejected'}`}>
                  {app.scholarshipDetail.eligible ? '✅ Eligible' : '❌ Not Eligible'}
                </span>
              </div>
              <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
                <div><div className="text-xs text-muted">Type</div><div className="text-sm font-semibold">{app.scholarshipDetail.scholarshipType.replace('_', ' ')}</div></div>
                <div><div className="text-xs text-muted">Category</div><div className="text-sm font-semibold">{app.scholarshipDetail.category || 'General'}</div></div>
                <div><div className="text-xs text-muted">BPL Certificate</div><div className="text-sm">{app.scholarshipDetail.bplCertificate ? '✅' : '❌'}</div></div>
                <div><div className="text-xs text-muted">Income Certificate</div><div className="text-sm">{app.scholarshipDetail.incomeCertificate ? '✅' : '❌'}</div></div>
              </div>
              {app.scholarshipDetail.achievements && (
                <div className="mt-2"><div className="text-xs text-muted">Achievements</div><div className="text-sm">{app.scholarshipDetail.achievements}</div></div>
              )}
              {app.scholarshipDetail.eligibilityNotes && (
                <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-glass)', borderRadius: 'var(--border-radius-md)' }}>
                  <div className="text-xs text-muted font-semibold mb-1">ELIGIBILITY CHECKS</div>
                  {app.scholarshipDetail.eligibilityNotes.split(' | ').map((note, i) => (
                    <div key={i} className="text-sm text-secondary" style={{ marginTop: 2 }}>
                      {note.includes('meets') || note.includes('qualifies') || note.includes('provided') ? '✅' : '⚠️'} {note}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Staff Notes */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">📝 Internal Staff Notes</h3></div>
            <div className="flex flex-col gap-3 mb-4">
              {app.staffNotes.length === 0 ? (
                <p className="text-sm text-muted">No notes yet.</p>
              ) : (
                app.staffNotes.map((note) => (
                  <div key={note.id} style={{ padding: 'var(--space-3)', background: 'var(--bg-glass)', borderRadius: 'var(--border-radius-md)', borderLeft: '3px solid var(--color-primary-500)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="avatar avatar-sm">{note.staff.name.charAt(0)}</span>
                      <span className="text-sm font-semibold">{note.staff.name}</span>
                      <span className="text-xs text-muted">{timeAgo(note.createdAt)}</span>
                      {note.isInternal && <span className="badge badge-draft" style={{ fontSize: '9px' }}>Internal</span>}
                    </div>
                    <div className="text-sm text-secondary">{note.content}</div>
                  </div>
                ))
              )}
            </div>
            {/* Add Note */}
            <div className="flex gap-2">
              <textarea className="form-textarea" placeholder="Add an internal note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={actionLoading || !noteText.trim()} style={{ alignSelf: 'flex-end' }}>
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar — Actions & Timeline */}
        <div className="flex flex-col gap-4">
          {/* Status Actions */}
          <div className="card">
            <h3 className="card-title mb-4">⚡ Quick Actions</h3>
            {currentActions.actions.length > 0 && (
              <>
                <div className="form-group">
                  <label className="form-label">Decision Note (optional)</label>
                  <textarea className="form-textarea" placeholder="Reason for decision..." value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={2} />
                </div>
                <div className="flex flex-col gap-2">
                  {currentActions.actions.map((act) => (
                    <button key={act.status} className={`btn ${act.className} w-full`} onClick={() => handleStatusChange(act.status)} disabled={actionLoading}>
                      {act.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Seat Assignment (only for approved apps without seats) */}
            {app.status === 'APPROVED' && !app.seatAssignment && (
              <button className="btn btn-accent w-full mt-2" onClick={handleAssignSeat} disabled={actionLoading}>
                💺 Assign Seat
              </button>
            )}
            {app.seatAssignment && (
              <div className="alert alert-success mt-2">
                💺 Seat assigned (Grade {app.seatAssignment.allocation.grade})
              </div>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="card">
            <h3 className="card-title mb-4">📋 Audit Trail</h3>
            <div className="timeline">
              {app.auditLogs.map((log) => (
                <div key={log.id} className="timeline-item">
                  <div className={`timeline-dot ${log.action.includes('APPROVED') || log.action === 'SEAT_ALLOCATED' ? 'success' : log.action.includes('REJECTED') ? 'error' : ''}`}></div>
                  <div className="timeline-content">
                    <div className="timeline-date">{formatDate(log.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="timeline-action">{log.changedBy.name}</div>
                    {log.description && <div className="timeline-description">{log.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
