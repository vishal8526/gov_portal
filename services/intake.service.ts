/**
 * ============================================================================
 * Application Intake Service
 * ============================================================================
 * Handles the submission, validation, and lifecycle management of applications.
 * This is the primary service for the parent-facing workflow, managing both
 * admission and scholarship applications from creation through submission.
 * 
 * Responsibilities:
 * - Create new applications with validation
 * - Calculate priority scores on submission
 * - Run scholarship eligibility pre-checks
 * - Retrieve applications with filtering and pagination
 * ============================================================================
 */

import { prisma } from '@/lib/prisma';
import { calculatePriorityScore, checkScholarshipEligibility } from '@/lib/utils';

/** Input shape for creating an admission application */
interface CreateAdmissionInput {
  parentId: string;
  studentName: string;
  studentDob: string;
  studentGender: string;
  gradeApplying: number;
  previousSchool?: string;
  previousGradePct?: number;
  address: string;
  phone: string;
  familyIncome?: number;
}

/** Extended input for scholarship applications */
interface CreateScholarshipInput extends CreateAdmissionInput {
  scholarshipType: string;
  category?: string;
  achievements?: string;
  bplCertificate: boolean;
  incomeCertificate: boolean;
  familyIncome: number;
}

/**
 * Creates a new admission application.
 * Automatically calculates priority score and creates an audit log entry.
 * 
 * @param input - Validated admission form data
 * @returns Created application record
 */
export async function createAdmissionApplication(input: CreateAdmissionInput) {
  const priorityScore = calculatePriorityScore({
    familyIncome: input.familyIncome,
    previousGradePct: input.previousGradePct,
    type: 'ADMISSION',
    submittedAt: new Date(),
  });

  const application = await prisma.application.create({
    data: {
      parentId: input.parentId,
      type: 'ADMISSION',
      status: 'SUBMITTED',
      priorityScore,
      studentName: input.studentName,
      studentDob: new Date(input.studentDob),
      studentGender: input.studentGender,
      gradeApplying: input.gradeApplying,
      previousSchool: input.previousSchool || null,
      previousGradePct: input.previousGradePct || null,
      address: input.address,
      phone: input.phone,
      familyIncome: input.familyIncome || null,
    },
  });

  // Create audit log for application creation
  await prisma.auditLog.create({
    data: {
      entityType: 'APPLICATION',
      entityId: application.id,
      action: 'CREATED',
      changedById: input.parentId,
      newValue: JSON.stringify({ type: 'ADMISSION', status: 'SUBMITTED' }),
      description: `Admission application submitted for ${input.studentName} (Grade ${input.gradeApplying})`,
    },
  });

  // Create notification for the parent
  await prisma.notification.create({
    data: {
      userId: input.parentId,
      applicationId: application.id,
      title: 'Application Submitted',
      message: `Your admission application for ${input.studentName} has been submitted successfully. Application ID: ${application.id.slice(0, 8).toUpperCase()}`,
      type: 'SUCCESS',
    },
  });

  return application;
}

/**
 * Creates a new scholarship application with eligibility pre-check.
 * Runs the eligibility engine and attaches results to the scholarship detail record.
 * 
 * @param input - Validated scholarship form data
 * @returns Created application with scholarship details
 */
export async function createScholarshipApplication(input: CreateScholarshipInput) {
  // Run eligibility pre-check before saving
  const eligibility = checkScholarshipEligibility({
    scholarshipType: input.scholarshipType,
    familyIncome: input.familyIncome,
    previousGradePct: input.previousGradePct,
    category: input.category,
    bplCertificate: input.bplCertificate,
    incomeCertificate: input.incomeCertificate,
  });

  const priorityScore = calculatePriorityScore({
    familyIncome: input.familyIncome,
    category: input.category,
    previousGradePct: input.previousGradePct,
    type: 'SCHOLARSHIP',
    submittedAt: new Date(),
  });

  // Use a transaction to ensure both records are created atomically
  const application = await prisma.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        parentId: input.parentId,
        type: 'SCHOLARSHIP',
        status: 'SUBMITTED',
        priorityScore: priorityScore + eligibility.score,
        studentName: input.studentName,
        studentDob: new Date(input.studentDob),
        studentGender: input.studentGender,
        gradeApplying: input.gradeApplying,
        previousSchool: input.previousSchool || null,
        previousGradePct: input.previousGradePct || null,
        address: input.address,
        phone: input.phone,
        familyIncome: input.familyIncome,
      },
    });

    // Create linked scholarship detail with eligibility results
    await tx.scholarshipDetail.create({
      data: {
        applicationId: app.id,
        scholarshipType: input.scholarshipType,
        category: input.category || null,
        achievements: input.achievements || null,
        bplCertificate: input.bplCertificate,
        incomeCertificate: input.incomeCertificate,
        eligible: eligibility.eligible,
        eligibilityNotes: eligibility.notes.join(' | '),
      },
    });

    return app;
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'APPLICATION',
      entityId: application.id,
      action: 'CREATED',
      changedById: input.parentId,
      newValue: JSON.stringify({
        type: 'SCHOLARSHIP',
        scholarshipType: input.scholarshipType,
        eligible: eligibility.eligible,
        status: 'SUBMITTED',
      }),
      description: `Scholarship application (${input.scholarshipType}) submitted for ${input.studentName}. Eligibility: ${eligibility.eligible ? 'PASSED' : 'FAILED'}`,
    },
  });

  // Notify the parent with eligibility result
  await prisma.notification.create({
    data: {
      userId: input.parentId,
      applicationId: application.id,
      title: eligibility.eligible ? 'Scholarship Application Submitted' : 'Scholarship Application — Review Needed',
      message: eligibility.eligible
        ? `Your ${input.scholarshipType.toLowerCase()} scholarship application for ${input.studentName} has passed the initial eligibility check.`
        : `Your ${input.scholarshipType.toLowerCase()} scholarship application for ${input.studentName} did not meet automatic eligibility criteria. It will still be reviewed by staff.`,
      type: eligibility.eligible ? 'SUCCESS' : 'WARNING',
    },
  });

  return { application, eligibility };
}

/**
 * Retrieves applications for a specific parent.
 * Includes related scholarship details for scholarship-type applications.
 * 
 * @param parentId - Parent user ID
 * @returns Array of applications with relations
 */
export async function getParentApplications(parentId: string) {
  return prisma.application.findMany({
    where: { parentId },
    include: {
      scholarshipDetail: true,
      seatAssignment: {
        include: { allocation: true },
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Retrieves a single application with full details.
 * Includes all related data for the detail view.
 * 
 * @param applicationId - Application UUID
 * @param parentId - Optional parent ID for ownership verification
 * @returns Application with all relations or null
 */
export async function getApplicationById(applicationId: string, parentId?: string) {
  const where: Record<string, string> = { id: applicationId };
  if (parentId) where.parentId = parentId;

  return prisma.application.findFirst({
    where,
    include: {
      parent: { select: { id: true, name: true, email: true, phone: true } },
      assignedReviewer: { select: { id: true, name: true, email: true } },
      scholarshipDetail: true,
      staffNotes: {
        include: { staff: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      seatAssignment: {
        include: {
          allocation: true,
          assignedBy: { select: { name: true } },
        },
      },
      auditLogs: {
        include: { changedBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
