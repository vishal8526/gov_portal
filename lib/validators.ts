/**
 * ============================================================================
 * Zod Validation Schemas
 * ============================================================================
 * Centralized validation schemas for all form inputs and API request bodies.
 * Used on both client-side (React Hook Form) and server-side (API routes)
 * to ensure consistent validation rules across the entire application.
 * ============================================================================
 */

import { z } from 'zod';

// ============================================================================
// Authentication Schemas
// ============================================================================

/** Registration form validation */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['PARENT', 'STAFF'], { message: 'Please select a role' }),
  phone: z.string().optional(),
});

/** Login form validation */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// Application Schemas
// ============================================================================

/** Admission application submission */
export const admissionSchema = z.object({
  studentName: z.string().min(2, 'Student name must be at least 2 characters').max(100),
  studentDob: z.string().min(1, 'Date of birth is required'),
  studentGender: z.enum(['Male', 'Female', 'Other'], { message: 'Please select gender' }),
  gradeApplying: z.coerce.number().int().min(1, 'Grade must be between 1 and 12').max(12),
  previousSchool: z.string().optional(),
  previousGradePct: z.coerce.number().min(0).max(100).optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  familyIncome: z.coerce.number().min(0, 'Income must be a positive number').optional(),
});

/** Scholarship application submission — extends admission with scholarship-specific fields */
export const scholarshipSchema = admissionSchema.extend({
  scholarshipType: z.enum(['MERIT', 'NEED_BASED', 'SPORTS', 'SPECIAL_CATEGORY'], {
    message: 'Please select scholarship type',
  }),
  category: z.enum(['GENERAL', 'SC', 'ST', 'OBC', 'EWS']).optional(),
  achievements: z.string().max(1000).optional(),
  bplCertificate: z.boolean().default(false),
  incomeCertificate: z.boolean().default(false),
  familyIncome: z.coerce.number().min(0, 'Income is required for scholarship applications'),
});

// ============================================================================
// Staff Action Schemas
// ============================================================================

/** Status update by staff (approve/reject/waitlist) */
export const statusUpdateSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED'], {
    message: 'Please select a status',
  }),
  note: z.string().max(1000).optional(),
});

/** Internal staff note */
export const staffNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(2000),
  isInternal: z.boolean().default(true),
});

/** Seat allocation configuration */
export const seatAllocationSchema = z.object({
  grade: z.coerce.number().int().min(1).max(12),
  totalSeats: z.coerce.number().int().min(1, 'Must have at least 1 seat'),
  academicYear: z.string().min(4, 'Academic year is required'),
});

/** Bulk action schema for processing multiple applications */
export const bulkActionSchema = z.object({
  applicationIds: z.array(z.string().uuid()).min(1, 'Select at least one application'),
  action: z.enum(['APPROVE', 'REJECT', 'WAITLIST', 'ASSIGN_REVIEWER']),
  note: z.string().max(1000).optional(),
  reviewerId: z.string().uuid().optional(),
});

// ============================================================================
// Type Exports — Inferred from schemas for type safety
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdmissionInput = z.infer<typeof admissionSchema>;
export type ScholarshipInput = z.infer<typeof scholarshipSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
export type StaffNoteInput = z.infer<typeof staffNoteSchema>;
export type SeatAllocationInput = z.infer<typeof seatAllocationSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
