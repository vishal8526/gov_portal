/**
 * ============================================================================
 * Seat Allocation Service
 * ============================================================================
 * Manages school seat capacity per grade and academic year.
 * Handles seat creation, assignment to approved applicants, and capacity tracking.
 * 
 * Key business rules:
 * - Each grade has a fixed total seat count per academic year
 * - Seats can only be assigned to APPROVED applications
 * - Seat assignments can be ASSIGNED → CONFIRMED or RELEASED
 * - Releasing a seat increments available count for waitlisted applicants
 * ============================================================================
 */

import { prisma } from '@/lib/prisma';

/**
 * Creates or updates a seat allocation for a specific grade and year.
 * If an allocation already exists, it updates the total seat count.
 * 
 * @param grade - Grade number (1-12)
 * @param totalSeats - Total seats available
 * @param academicYear - Academic year string (e.g., "2025-26")
 * @returns Created or updated seat allocation
 */
export async function upsertSeatAllocation(grade: number, totalSeats: number, academicYear: string) {
  return prisma.seatAllocation.upsert({
    where: {
      grade_academicYear: { grade, academicYear },
    },
    update: { totalSeats },
    create: { grade, totalSeats, academicYear },
  });
}

/**
 * Retrieves all seat allocations for a given academic year.
 * Includes assignment counts and related application data.
 * 
 * @param academicYear - Academic year to query
 * @returns Array of seat allocations with computed availability
 */
export async function getSeatAllocations(academicYear: string) {
  const allocations = await prisma.seatAllocation.findMany({
    where: { academicYear },
    include: {
      assignments: {
        include: {
          application: {
            select: { studentName: true, status: true, parentId: true },
          },
          assignedBy: { select: { name: true } },
        },
      },
    },
    orderBy: { grade: 'asc' },
  });

  // Compute available seats factoring in active assignments
  return allocations.map((alloc) => {
    const activeAssignments = alloc.assignments.filter(
      (a) => a.status !== 'RELEASED'
    );
    return {
      ...alloc,
      allocatedSeats: activeAssignments.length,
      availableSeats: alloc.totalSeats - activeAssignments.length,
      utilizationPct: Math.round((activeAssignments.length / alloc.totalSeats) * 100),
    };
  });
}

/**
 * Assigns a seat to an approved application.
 * Validates that seats are available and the application is in APPROVED status.
 * 
 * @param applicationId - Application to assign a seat to
 * @param staffId - Staff member performing the assignment
 * @returns Created seat assignment
 * @throws Error if no seats available or application not approved
 */
export async function assignSeat(applicationId: string, staffId: string) {
  return prisma.$transaction(async (tx) => {
    // Get the application with its grade info
    const application = await tx.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) throw new Error('Application not found');
    if (application.status !== 'APPROVED') {
      throw new Error('Can only assign seats to approved applications');
    }

    // Check for existing assignment
    const existing = await tx.seatAssignment.findUnique({
      where: { applicationId },
    });
    if (existing) throw new Error('Application already has a seat assigned');

    // Find available allocation for this grade
    const allocation = await tx.seatAllocation.findFirst({
      where: {
        grade: application.gradeApplying,
        academicYear: getCurrentAcademicYear(),
      },
      include: {
        assignments: {
          where: { status: { not: 'RELEASED' } },
        },
      },
    });

    if (!allocation) {
      throw new Error(`No seat allocation found for Grade ${application.gradeApplying}`);
    }

    const activeCount = allocation.assignments.length;
    if (activeCount >= allocation.totalSeats) {
      throw new Error(`No seats available in Grade ${application.gradeApplying} (${activeCount}/${allocation.totalSeats} filled)`);
    }

    // Create the seat assignment
    const assignment = await tx.seatAssignment.create({
      data: {
        applicationId,
        allocationId: allocation.id,
        assignedById: staffId,
      },
    });

    // Update allocated count
    await tx.seatAllocation.update({
      where: { id: allocation.id },
      data: { allocatedSeats: activeCount + 1 },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        entityType: 'SEAT',
        entityId: applicationId,
        action: 'SEAT_ALLOCATED',
        changedById: staffId,
        newValue: JSON.stringify({
          grade: application.gradeApplying,
          allocationId: allocation.id,
          seatNumber: activeCount + 1,
        }),
        description: `Seat assigned for ${application.studentName} in Grade ${application.gradeApplying} (Seat ${activeCount + 1}/${allocation.totalSeats})`,
      },
    });

    // Notify parent
    await tx.notification.create({
      data: {
        userId: application.parentId,
        applicationId,
        title: '🎓 Seat Assigned!',
        message: `A seat has been assigned for ${application.studentName} in Grade ${application.gradeApplying} for the ${getCurrentAcademicYear()} academic year.`,
        type: 'SUCCESS',
      },
    });

    return assignment;
  });
}

/**
 * Releases a previously assigned seat, making it available for others.
 * @param assignmentId - Seat assignment ID to release
 * @param staffId - Staff member releasing the seat
 */
export async function releaseSeat(assignmentId: string, staffId: string) {
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.seatAssignment.findUnique({
      where: { id: assignmentId },
      include: { application: true, allocation: true },
    });

    if (!assignment) throw new Error('Seat assignment not found');
    if (assignment.status === 'RELEASED') throw new Error('Seat already released');

    await tx.seatAssignment.update({
      where: { id: assignmentId },
      data: { status: 'RELEASED' },
    });

    await tx.seatAllocation.update({
      where: { id: assignment.allocationId },
      data: { allocatedSeats: { decrement: 1 } },
    });

    await tx.auditLog.create({
      data: {
        entityType: 'SEAT',
        entityId: assignment.applicationId,
        action: 'STATUS_CHANGED',
        changedById: staffId,
        oldValue: JSON.stringify({ status: assignment.status }),
        newValue: JSON.stringify({ status: 'RELEASED' }),
        description: `Seat released for Grade ${assignment.allocation.grade}`,
      },
    });

    return assignment;
  });
}

/**
 * Returns the current academic year string based on today's date.
 * Academic year runs from April to March (Indian school system).
 * e.g., In January 2025, the academic year is "2024-25"
 */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (0=Jan)
  
  // If April or later, current year starts the academic year
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
  // Before April, previous year starts the academic year
  return `${year - 1}-${year.toString().slice(-2)}`;
}

/**
 * Gets seat utilization summary across all grades for the dashboard.
 */
export async function getSeatSummary() {
  const allocations = await getSeatAllocations(getCurrentAcademicYear());
  
  const totalSeats = allocations.reduce((sum, a) => sum + a.totalSeats, 0);
  const allocatedSeats = allocations.reduce((sum, a) => sum + a.allocatedSeats, 0);
  
  return {
    totalSeats,
    allocatedSeats,
    availableSeats: totalSeats - allocatedSeats,
    utilizationPct: totalSeats > 0 ? Math.round((allocatedSeats / totalSeats) * 100) : 0,
    byGrade: allocations,
  };
}
