/**
 * ============================================================================
 * Audit Service
 * ============================================================================
 * Provides read access to the audit trail. Audit log entries are created by
 * other services; this service handles querying and presentation.
 * ============================================================================
 */

import { prisma } from '@/lib/prisma';

/**
 * Retrieves audit logs for a specific application, ordered chronologically.
 * Used to render the timeline view on the application detail page.
 * 
 * @param applicationId - Application ID to get history for
 * @returns Array of audit log entries with user info
 */
export async function getApplicationAuditTrail(applicationId: string) {
  return prisma.auditLog.findMany({
    where: { entityId: applicationId },
    include: {
      changedBy: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Retrieves recent audit logs across all entities.
 * Used for the staff activity feed on the dashboard.
 * 
 * @param limit - Maximum number of entries to return
 * @returns Array of recent audit log entries
 */
export async function getRecentActivity(limit: number = 20) {
  return prisma.auditLog.findMany({
    include: {
      changedBy: { select: { name: true, role: true } },
      application: { select: { studentName: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Gets audit statistics — count of actions by type in the last 7 days.
 */
export async function getAuditStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const stats = await prisma.auditLog.groupBy({
    by: ['action'],
    _count: { id: true },
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
  });

  return Object.fromEntries(stats.map((s) => [s.action, s._count.id]));
}
