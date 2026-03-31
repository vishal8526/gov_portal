/**
 * ============================================================================
 * Staff Review Queue — Filterable, sortable application list
 * ============================================================================
 * The central workstation for staff to review, approve, reject, and manage
 * applications. Features search, filters, bulk actions, and priority indicators.
 * ============================================================================
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatStatus, getStatusColor, timeAgo } from '@/lib/utils';

interface Application {
  id: string;
  type: string;
  status: string;
  priorityScore: number;
  studentName: string;
  gradeApplying: number;
  familyIncome: number | null;
  createdAt: string;
  submittedAt: string;
  parent: { name: string; email: string };
  assignedReviewer?: { name: string } | null;
  scholarshipDetail?: { scholarshipType: string; eligible: boolean } | null;
  _count: { staffNotes: number };
}

export default function ReviewQueuePage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [status, setStatus] = useState(initialStatus);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('priorityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', page.toString());
    params.set('pageSize', '20');

    try {
      const res = await fetch(`/api/applications?${params}`);
      const data = await res.json();
      setApplications(data.applications || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch { /* ignore */ }
    setLoading(false);
  }, [status, type, search, sortBy, sortOrder, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchApplications();
  }, [fetchApplications]);

  // Toggle selection for bulk actions
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === applications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(applications.map((a) => a.id)));
    }
  };

  // Bulk action handler
  const handleBulkAction = async (action: string) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await fetch('/api/applications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: Array.from(selected),
          action,
          note: `Bulk ${action.toLowerCase()} action`,
        }),
      });
      setSelected(new Set());
      fetchApplications();
    } catch { /* ignore */ }
    setBulkLoading(false);
  };

  const getPriorityLevel = (score: number) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  return (
    <div>
      <div className="page-title-section">
        <h1 className="page-title">📋 Review Queue</h1>
        <p className="page-subtitle">{total} applications found</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search by name, email, or ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="WAITLISTED">Waitlisted</option>
        </select>
        <select className="form-select" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="ADMISSION">Admission</option>
          <option value="SCHOLARSHIP">Scholarship</option>
        </select>
        <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="priorityScore">Priority</option>
          <option value="createdAt">Date</option>
          <option value="studentName">Name</option>
          <option value="gradeApplying">Grade</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => setSortOrder((o) => o === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="alert alert-info mb-4">
          <span>✨</span>
          <div className="flex items-center gap-3 w-full">
            <span className="font-semibold">{selected.size} selected</span>
            <div className="ml-auto flex gap-2">
              <button className="btn btn-accent btn-sm" onClick={() => handleBulkAction('APPROVE')} disabled={bulkLoading}>✅ Approve</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleBulkAction('REJECT')} disabled={bulkLoading}>❌ Reject</button>
              <button className="btn btn-warning btn-sm" onClick={() => handleBulkAction('WAITLIST')} disabled={bulkLoading}>⏳ Waitlist</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Applications Table */}
      {loading ? (
        <div className="flex flex-col gap-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 56 }}></div>)}</div>
      ) : applications.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No Applications Found</div>
          <p className="text-sm text-muted">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selected.size === applications.length && applications.length > 0} onChange={selectAll} style={{ accentColor: 'var(--color-accent-500)' }} />
                </th>
                <th>Student / Parent</th>
                <th>Type</th>
                <th>Grade</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(app.id)} onChange={() => toggleSelect(app.id)} style={{ accentColor: 'var(--color-accent-500)' }} />
                  </td>
                  <td>
                    <div className="font-semibold text-sm">{app.studentName}</div>
                    <div className="text-xs text-muted">{app.parent.name} • {app.parent.email}</div>
                  </td>
                  <td>
                    <span className="text-sm">{app.type === 'ADMISSION' ? '🏫' : '🎓'} {app.type === 'ADMISSION' ? 'Admission' : 'Scholarship'}</span>
                    {app.scholarshipDetail && (
                      <div className="text-xs text-muted">{app.scholarshipDetail.scholarshipType.replace('_', ' ')} {app.scholarshipDetail.eligible ? '✅' : '⚠️'}</div>
                    )}
                  </td>
                  <td><span className="font-semibold">{app.gradeApplying}</span></td>
                  <td>
                    <div className="priority-indicator">
                      <div className="priority-bar">
                        <div className={`priority-fill ${getPriorityLevel(app.priorityScore)}`} style={{ width: `${app.priorityScore}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold">{app.priorityScore}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${getStatusColor(app.status)}`}>{formatStatus(app.status)}</span></td>
                  <td>
                    <div className="text-xs text-muted">{timeAgo(app.submittedAt)}</div>
                    {app.assignedReviewer && <div className="text-xs text-muted">→ {app.assignedReviewer.name}</div>}
                  </td>
                  <td>
                    <Link href={`/staff/review/${app.id}`} className="btn btn-primary btn-sm">Review →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span className="text-sm text-secondary">Page {page} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
