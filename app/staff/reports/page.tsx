/**
 * ============================================================================
 * Staff Reports — Summary reporting for admissions and scholarships
 * ============================================================================
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatStatus } from '@/lib/utils';

interface DashboardData {
  stats: {
    totalApplications: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    approvalRate: number;
  };
  seatSummary: {
    totalSeats: number;
    allocatedSeats: number;
    availableSeats: number;
    utilizationPct: number;
  };
}

export default function StaffReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const reportRows = useMemo(() => {
    if (!data) return [];

    return Object.entries(data.stats.byStatus).map(([status, count]) => {
      const total = data.stats.totalApplications || 1;
      const percentage = Math.round((count / total) * 100);

      return { status, count, percentage };
    });
  }, [data]);

  if (loading || !data) {
    return (
      <div>
        <div className="skeleton skeleton-title mb-6"></div>
        <div className="card">
          <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 'var(--space-3)' }}></div>
          <div className="skeleton skeleton-card" style={{ height: 220 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title-section">
        <h1 className="page-title">📈 Reports</h1>
        <p className="page-subtitle">Operational summary for staff decision-making</p>
      </div>

      <div className="grid-stats mb-6">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{data.stats.totalApplications}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{data.stats.approvalRate}%</div>
          <div className="stat-label">Approval Rate</div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-icon">🏫</div>
          <div className="stat-value">{data.stats.byType.ADMISSION || 0}</div>
          <div className="stat-label">Admission Applications</div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">🎓</div>
          <div className="stat-value">{data.stats.byType.SCHOLARSHIP || 0}</div>
          <div className="stat-label">Scholarship Applications</div>
        </div>
        <div className="stat-card stat-card-error">
          <div className="stat-icon">💺</div>
          <div className="stat-value">{data.seatSummary.utilizationPct}%</div>
          <div className="stat-label">Seat Utilization</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Status Distribution</h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr key={row.status}>
                  <td>
                    <span className={`badge badge-${row.status.toLowerCase() === 'under_review' ? 'review' : row.status.toLowerCase()}`}>
                      {formatStatus(row.status)}
                    </span>
                  </td>
                  <td>{row.count}</td>
                  <td>{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
