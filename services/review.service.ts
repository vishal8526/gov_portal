/**
 * ============================================================================
 * Review & Decision Service
 * ============================================================================
 * Handles the staff-facing review workflow including application evaluation,
 * status transitions, reviewer assignment, and internal notes. Ensures all
 * changes are audit-logged for traceability.
 * 
 * Status Flow: SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED / WAITLISTED
 * ============================================================================
 */

import { prisma } from '@/lib/prisma';

/** Filter options for the review queue */
interface ReviewQueueFilters {
  status?: string;
  type?: string;
  grade?: number;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Retrieves the staff review queue with filtering, sorting, and pagination.
 * Returns applications with related data needed for the queue view.
 * 
 * @param filters - Query parameters for filtering and sorting
 * @returns Paginated list of applications and total count
 */
export async function getReviewQueue(filters: ReviewQueueFilters = {}) {
  const {
    status,
    type,
    grade,
    assignedTo,
    search,
    sortBy = 'priorityScore',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
  } = filters;

  // Build dynamic where clause based on active filters
  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (type) where.type = type;
  if (grade) where.gradeApplying = grade;
  if (assignedTo) where.assignedReviewerId = assignedTo;

  // Text search across student name and parent info
  if (search) {
    where.OR = [
      { studentName: { contains: search } },
      { parent: { name: { contains: search } } },
      { parent: { email: { contains: search } } },
      { id: { startsWith: search } },
    ];
  }

  // Build sort configuration
  const orderBy: Record<string, string> = {};
  const validSortFields = ['priorityScore', 'createdAt', 'studentName', 'gradeApplying', 'status'];
  if (validSortFields.includes(sortBy)) {
    orderBy[sortBy] = sortOrder;
  } else {
    orderBy.priorityScore = 'desc';
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        parent: { select: { name: true, email: true, phone: true } },
        assignedReviewer: { select: { name: true } },
        scholarshipDetail: true,
        _count: { select: { staffNotes: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Updates the status of an application with full audit trail.
 * Validates the status transition and creates notifications for the parent.
 * 
 * @param applicationId - Application ID to update
 * @param newStatus - New status to set
 * @param staffId - ID of the staff member making the change
 * @param note - Optional note explaining the decision
 * @returns Updated application
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  staffId: string,
  note?: string
) {
  // Validate transition rules
  const validTransitions: Record<string, string[]> = {
    SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED', 'WAITLISTED'],
    WAITLISTED: ['APPROVED', 'REJECTED', 'UNDER_REVIEW'],
    APPROVED: ['WAITLISTED'],  // Allow reverting approval
    REJECTED: ['UNDER_REVIEW'],  // Allow re-review
  };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { parent: true },
  });

  if (!application) throw new Error('Application not found');

  const allowed = validTransitions[application.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from ${application.status} to ${newStatus}`);
  }

  // Update the application status in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        reviewedAt: ['APPROVED', 'REJECTED', 'WAITLISTED'].includes(newStatus) ? new Date() : undefined,
        assignedReviewerId: application.assignedReviewerId || staffId,
      },
    });

    // Create audit log for the status change
    await tx.auditLog.create({
      data: {
        entityType: 'APPLICATION',
        entityId: applicationId,
        action: 'STATUS_CHANGED',
        changedById: staffId,
        oldValue: JSON.stringify({ status: application.status }),
        newValue: JSON.stringify({ status: newStatus }),
        description: `Status changed from ${application.status} to ${newStatus}${note ? `: ${note}` : ''}`,
      },
    });

    // Add staff note if provided
    if (note) {
      await tx.staffNote.create({
        data: {
          applicationId,
          staffId,
          content: note,
          isInternal: true,
        },
      });
    }

    // Notify the parent about the status change
    const statusMessages: Record<string, { title: string; message: string; type: string }> = {
      UNDER_REVIEW: {
        title: 'Application Under Review',
        message: `Your application for ${application.studentName} is now being reviewed by our team.`,
        type: 'INFO',
      },
      APPROVED: {
        title: '🎉 Application Approved!',
        message: `Congratulations! Your application for ${application.studentName} has been approved.`,
        type: 'SUCCESS',
      },
      REJECTED: {
        title: 'Application Update',
        message: `Your application for ${application.studentName} was not approved at this time. Please contact the school for more information.`,
        type: 'ERROR',
      },
      WAITLISTED: {
        title: 'Application Waitlisted',
        message: `Your application for ${application.studentName} has been placed on the waitlist. We will notify you if a seat becomes available.`,
        type: 'WARNING',
      },
    };

    const msg = statusMessages[newStatus];
    if (msg) {
      await tx.notification.create({
        data: {
          userId: application.parentId,
          applicationId,
          title: msg.title,
          message: msg.message,
          type: msg.type,
        },
      });
    }

    return result;
  });

  return updated;
}

/**
 * Assigns a reviewer to an application.
 * @param applicationId - Application ID
 * @param reviewerId - Staff user ID to assign
 * @param assignedById - Staff user ID performing the assignment
 */
export async function assignReviewer(applicationId: string, reviewerId: string, assignedById: string) {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { assignedReviewerId: reviewerId },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'APPLICATION',
      entityId: applicationId,
      action: 'ASSIGNED',
      changedById: assignedById,
      newValue: JSON.stringify({ assignedReviewerId: reviewerId }),
      description: `Application assigned for review`,
    },
  });

  return application;
}

/**
 * Adds an internal staff note to an application.
 * @param applicationId - Application ID
 * @param staffId - Staff member's user ID
 * @param content - Note text content
 * @param isInternal - Whether the note is internal-only (not visible to parents)
 */
export async function addStaffNote(
  applicationId: string,
  staffId: string,
  content: string,
  isInternal: boolean = true
) {
  const note = await prisma.staffNote.create({
    data: {
      applicationId,
      staffId,
      content,
      isInternal,
    },
    include: {
      staff: { select: { name: true } },
    },
  });

  // Log the note addition
  await prisma.auditLog.create({
    data: {
      entityType: 'APPLICATION',
      entityId: applicationId,
      action: 'NOTE_ADDED',
      changedById: staffId,
      newValue: JSON.stringify({ noteId: note.id, isInternal }),
      description: `Staff note added${isInternal ? ' (internal)' : ''}`,
    },
  });

  return note;
}

/**
 * Performs bulk status updates on multiple applications.
 * Used by staff for batch processing of applications.
 * 
 * @param applicationIds - Array of application IDs
 * @param action - Action to perform (APPROVE, REJECT, WAITLIST)
 * @param staffId - Staff member performing the action
 * @param note - Optional note for all applications
 * @returns Results summary with success/failure counts
 */
export async function bulkUpdateStatus(
  applicationIds: string[],
  action: string,
  staffId: string,
  note?: string
) {
  const statusMap: Record<string, string> = {
    APPROVE: 'APPROVED',
    REJECT: 'REJECTED',
    WAITLIST: 'WAITLISTED',
  };

  const newStatus = statusMap[action];
  if (!newStatus) throw new Error(`Invalid action: ${action}`);

  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const id of applicationIds) {
    try {
      await updateApplicationStatus(id, newStatus, staffId, note);
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push(`${id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return results;
}

/**
 * Gets dashboard statistics for the staff overview.
 * Aggregates application counts by status, type, and other dimensions.
 */
export async function getDashboardStats() {
  const [
    totalApplications,
    statusCounts,
    typeCounts,
    recentApplications,
    todayCount,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.application.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.application.groupBy({
      by: ['type'],
      _count: { id: true },
    }),
    prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        parent: { select: { name: true } },
      },
    }),
    prisma.application.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  // Transform grouped counts into a more usable format
  const byStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.id])
  );
  const byType = Object.fromEntries(
    typeCounts.map((t) => [t.type, t._count.id])
  );

  return {
    totalApplications,
    todayCount,
    byStatus,
    byType,
    recentApplications,
    pendingReview: (byStatus['SUBMITTED'] || 0) + (byStatus['UNDER_REVIEW'] || 0),
    approvalRate: totalApplications > 0
      ? Math.round(((byStatus['APPROVED'] || 0) / totalApplications) * 100)
      : 0,
  };
}
