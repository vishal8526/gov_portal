/**
 * ============================================================================
 * Database Seed Script
 * ============================================================================
 * Populates the database with realistic demo data for testing and demo purposes.
 * Creates sample users (parents + staff), applications in various states,
 * seat allocations, notes, and notifications.
 * 
 * Run with: npx tsx prisma/seed.ts
 * ============================================================================
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed script.');
}

const pool = new Pool({
  connectionString,
  max: 5,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (in reverse dependency order)
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.staffNote.deleteMany();
  await prisma.seatAssignment.deleteMany();
  await prisma.seatAllocation.deleteMany();
  await prisma.scholarshipDetail.deleteMany();
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();

  // ========================================================================
  // Create Users
  // ========================================================================
  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.user.create({
    data: {
      email: 'admin@govschool.edu.in',
      name: 'Dr. Priya Sharma',
      passwordHash,
      role: 'ADMIN',
      phone: '9876543210',
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'reviewer@govschool.edu.in',
      name: 'Rajesh Kumar',
      passwordHash,
      role: 'STAFF',
      phone: '9876543211',
    },
  });

  const staff3 = await prisma.user.create({
    data: {
      email: 'staff@govschool.edu.in',
      name: 'Anita Desai',
      passwordHash,
      role: 'STAFF',
      phone: '9876543212',
    },
  });

  const parent1 = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      name: 'Ramesh Patel',
      passwordHash,
      role: 'PARENT',
      phone: '9876543213',
    },
  });

  const parent2 = await prisma.user.create({
    data: {
      email: 'sunita@example.com',
      name: 'Sunita Verma',
      passwordHash,
      role: 'PARENT',
      phone: '9876543214',
    },
  });

  const parent3 = await prisma.user.create({
    data: {
      email: 'anil@example.com',
      name: 'Anil Gupta',
      passwordHash,
      role: 'PARENT',
      phone: '9876543215',
    },
  });

  const parent4 = await prisma.user.create({
    data: {
      email: 'meena@example.com',
      name: 'Meena Devi',
      passwordHash,
      role: 'PARENT',
      phone: '9876543216',
    },
  });

  console.log('✅ Users created');

  // ========================================================================
  // Create Seat Allocations for grades 1-12
  // ========================================================================
  const academicYear = '2025-26';
  const seatData = [
    { grade: 1, totalSeats: 40 },
    { grade: 2, totalSeats: 40 },
    { grade: 3, totalSeats: 35 },
    { grade: 4, totalSeats: 35 },
    { grade: 5, totalSeats: 35 },
    { grade: 6, totalSeats: 30 },
    { grade: 7, totalSeats: 30 },
    { grade: 8, totalSeats: 30 },
    { grade: 9, totalSeats: 25 },
    { grade: 10, totalSeats: 25 },
    { grade: 11, totalSeats: 20 },
    { grade: 12, totalSeats: 20 },
  ];

  const allocations: Record<number, string> = {};
  for (const seat of seatData) {
    const alloc = await prisma.seatAllocation.create({
      data: { ...seat, academicYear },
    });
    allocations[seat.grade] = alloc.id;
  }

  console.log('✅ Seat allocations created');

  // ========================================================================
  // Create Sample Applications
  // ========================================================================
  
  // Application 1: Approved admission
  const app1 = await prisma.application.create({
    data: {
      parentId: parent1.id,
      type: 'ADMISSION',
      status: 'APPROVED',
      priorityScore: 65,
      studentName: 'Arjun Patel',
      studentDob: new Date('2017-05-15'),
      studentGender: 'Male',
      gradeApplying: 3,
      previousSchool: 'City Public School',
      previousGradePct: 85.5,
      address: '42, MG Road, Sector 15, Delhi',
      phone: '9876543213',
      familyIncome: 320000,
      assignedReviewerId: staff2.id,
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Application 2: Submitted, awaiting review
  const app2 = await prisma.application.create({
    data: {
      parentId: parent2.id,
      type: 'ADMISSION',
      status: 'SUBMITTED',
      priorityScore: 78,
      studentName: 'Kavya Verma',
      studentDob: new Date('2016-08-22'),
      studentGender: 'Female',
      gradeApplying: 5,
      previousSchool: 'Greenfield Academy',
      previousGradePct: 92.0,
      address: '18, Nehru Nagar, Pune',
      phone: '9876543214',
      familyIncome: 180000,
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Application 3: Scholarship - Under Review
  const app3 = await prisma.application.create({
    data: {
      parentId: parent2.id,
      type: 'SCHOLARSHIP',
      status: 'UNDER_REVIEW',
      priorityScore: 88,
      studentName: 'Rohit Verma',
      studentDob: new Date('2014-03-10'),
      studentGender: 'Male',
      gradeApplying: 8,
      previousSchool: 'Government School No. 5',
      previousGradePct: 94.5,
      address: '18, Nehru Nagar, Pune',
      phone: '9876543214',
      familyIncome: 85000,
      assignedReviewerId: staff2.id,
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.scholarshipDetail.create({
    data: {
      applicationId: app3.id,
      scholarshipType: 'MERIT',
      category: 'OBC',
      achievements: 'District-level science olympiad winner. School topper for 3 consecutive years.',
      bplCertificate: false,
      incomeCertificate: true,
      eligible: true,
      eligibilityNotes: 'Academic score 94.5% meets merit threshold (≥80%) | Family income ₹85,000 is within threshold',
    },
  });

  // Application 4: Scholarship - Need Based, Submitted
  const app4 = await prisma.application.create({
    data: {
      parentId: parent3.id,
      type: 'SCHOLARSHIP',
      status: 'SUBMITTED',
      priorityScore: 92,
      studentName: 'Priya Gupta',
      studentDob: new Date('2015-11-28'),
      studentGender: 'Female',
      gradeApplying: 6,
      previousSchool: 'Vidya Mandir',
      previousGradePct: 76.0,
      address: '7, Gandhi Colony, Jaipur',
      phone: '9876543215',
      familyIncome: 50000,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.scholarshipDetail.create({
    data: {
      applicationId: app4.id,
      scholarshipType: 'NEED_BASED',
      category: 'SC',
      achievements: null,
      bplCertificate: true,
      incomeCertificate: true,
      eligible: true,
      eligibilityNotes: 'Family income ₹50,000 is within threshold (≤₹2,50,000) | Income certificate provided | BPL certificate provided — additional priority granted | Extra priority: Family income below ₹1,00,000',
    },
  });

  // Application 5: Rejected
  const app5 = await prisma.application.create({
    data: {
      parentId: parent3.id,
      type: 'ADMISSION',
      status: 'REJECTED',
      priorityScore: 25,
      studentName: 'Vikram Gupta',
      studentDob: new Date('2013-07-04'),
      studentGender: 'Male',
      gradeApplying: 9,
      previousSchool: 'Private International School',
      previousGradePct: 55.0,
      address: '7, Gandhi Colony, Jaipur',
      phone: '9876543215',
      familyIncome: 1200000,
      assignedReviewerId: staff3.id,
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  // Application 6: Waitlisted
  const app6 = await prisma.application.create({
    data: {
      parentId: parent4.id,
      type: 'ADMISSION',
      status: 'WAITLISTED',
      priorityScore: 55,
      studentName: 'Neha Devi',
      studentDob: new Date('2018-01-20'),
      studentGender: 'Female',
      gradeApplying: 1,
      previousSchool: null,
      previousGradePct: null,
      address: '23, Industrial Area, Lucknow',
      phone: '9876543216',
      familyIncome: 200000,
      assignedReviewerId: staff2.id,
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Application 7: Sports scholarship, submitted
  const app7 = await prisma.application.create({
    data: {
      parentId: parent4.id,
      type: 'SCHOLARSHIP',
      status: 'SUBMITTED',
      priorityScore: 70,
      studentName: 'Ravi Devi',
      studentDob: new Date('2012-09-12'),
      studentGender: 'Male',
      gradeApplying: 10,
      previousSchool: 'Sports Academy',
      previousGradePct: 72.0,
      address: '23, Industrial Area, Lucknow',
      phone: '9876543216',
      familyIncome: 150000,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.scholarshipDetail.create({
    data: {
      applicationId: app7.id,
      scholarshipType: 'SPORTS',
      category: 'EWS',
      achievements: 'State-level cricket champion. Selected for district team. National-level athletics participant.',
      bplCertificate: true,
      incomeCertificate: true,
      eligible: true,
      eligibilityNotes: 'Sports scholarship — achievements will be verified by review committee | BPL certificate provided — additional priority granted | Extra priority: Family income below ₹1,00,000',
    },
  });

  // More applications for bulk
  await prisma.application.create({
    data: {
      parentId: parent1.id,
      type: 'ADMISSION',
      status: 'SUBMITTED',
      priorityScore: 45,
      studentName: 'Ananya Patel',
      studentDob: new Date('2019-02-14'),
      studentGender: 'Female',
      gradeApplying: 1,
      address: '42, MG Road, Sector 15, Delhi',
      phone: '9876543213',
      familyIncome: 450000,
      submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Applications created');

  // ========================================================================
  // Create Seat Assignment for approved application
  // ========================================================================
  await prisma.seatAssignment.create({
    data: {
      applicationId: app1.id,
      allocationId: allocations[3],
      assignedById: staff2.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.seatAllocation.update({
    where: { id: allocations[3] },
    data: { allocatedSeats: 1 },
  });

  console.log('✅ Seat assignments created');

  // ========================================================================
  // Create Staff Notes
  // ========================================================================
  await prisma.staffNote.createMany({
    data: [
      {
        applicationId: app1.id,
        staffId: staff2.id,
        content: 'Good academic record. Documents verified. Recommend approval.',
        isInternal: true,
      },
      {
        applicationId: app3.id,
        staffId: staff2.id,
        content: 'Exceptional merit student. Income certificate verified with district office.',
        isInternal: true,
      },
      {
        applicationId: app3.id,
        staffId: staff3.id,
        content: 'Science olympiad certificates verified. Confirmed district-level win in 2024.',
        isInternal: true,
      },
      {
        applicationId: app5.id,
        staffId: staff3.id,
        content: 'Income exceeds threshold for general category. Grade percentage below minimum requirement.',
        isInternal: true,
      },
      {
        applicationId: app6.id,
        staffId: staff2.id,
        content: 'Grade 1 seats are fully allocated. Placed on waitlist pending potential releases.',
        isInternal: true,
      },
    ],
  });

  console.log('✅ Staff notes created');

  // ========================================================================
  // Create Audit Logs
  // ========================================================================
  await prisma.auditLog.createMany({
    data: [
      {
        entityType: 'APPLICATION',
        entityId: app1.id,
        action: 'CREATED',
        changedById: parent1.id,
        description: 'Admission application submitted for Arjun Patel (Grade 3)',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        entityType: 'APPLICATION',
        entityId: app1.id,
        action: 'STATUS_CHANGED',
        changedById: staff2.id,
        oldValue: '{"status":"SUBMITTED"}',
        newValue: '{"status":"UNDER_REVIEW"}',
        description: 'Status changed from SUBMITTED to UNDER_REVIEW',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        entityType: 'APPLICATION',
        entityId: app1.id,
        action: 'STATUS_CHANGED',
        changedById: staff2.id,
        oldValue: '{"status":"UNDER_REVIEW"}',
        newValue: '{"status":"APPROVED"}',
        description: 'Status changed from UNDER_REVIEW to APPROVED: Documents verified, meets all criteria.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        entityType: 'SEAT',
        entityId: app1.id,
        action: 'SEAT_ALLOCATED',
        changedById: staff2.id,
        description: 'Seat assigned for Arjun Patel in Grade 3 (Seat 1/35)',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        entityType: 'APPLICATION',
        entityId: app3.id,
        action: 'STATUS_CHANGED',
        changedById: staff2.id,
        oldValue: '{"status":"SUBMITTED"}',
        newValue: '{"status":"UNDER_REVIEW"}',
        description: 'Scholarship application picked up for review',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Audit logs created');

  // ========================================================================
  // Create Notifications
  // ========================================================================
  await prisma.notification.createMany({
    data: [
      {
        userId: parent1.id,
        applicationId: app1.id,
        title: '🎉 Application Approved!',
        message: 'Your admission application for Arjun Patel has been approved. A seat has been assigned in Grade 3.',
        type: 'SUCCESS',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: parent2.id,
        applicationId: app2.id,
        title: 'Application Submitted',
        message: 'Your admission application for Kavya Verma has been submitted successfully.',
        type: 'SUCCESS',
        isRead: false,
      },
      {
        userId: parent2.id,
        applicationId: app3.id,
        title: 'Application Under Review',
        message: 'Your scholarship application for Rohit Verma is now being reviewed by our team.',
        type: 'INFO',
        isRead: false,
      },
      {
        userId: parent3.id,
        applicationId: app5.id,
        title: 'Application Update',
        message: 'Your admission application for Vikram Gupta was not approved at this time.',
        type: 'ERROR',
        isRead: false,
      },
      {
        userId: parent4.id,
        applicationId: app6.id,
        title: 'Application Waitlisted',
        message: 'Your admission application for Neha Devi has been placed on the waitlist.',
        type: 'WARNING',
        isRead: false,
      },
    ],
  });

  console.log('✅ Notifications created');
  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Parent:  parent@example.com / password123');
  console.log('  Staff:   reviewer@govschool.edu.in / password123');
  console.log('  Admin:   admin@govschool.edu.in / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
