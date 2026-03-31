import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  application: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
  scholarshipDetail: { create: vi.fn() },
  auditLog: { create: vi.fn() },
  notification: { create: vi.fn() },
  seatAssignment: { findUnique: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { createAdmissionApplication, createScholarshipApplication } from '@/services/intake.service';

describe('intake service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates admission applications with audit trail and notification', async () => {
    prismaMock.application.create.mockResolvedValue({ id: 'app-1', studentName: 'Asha' });
    prismaMock.auditLog.create.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    const application = await createAdmissionApplication({
      parentId: 'parent-1',
      studentName: 'Asha',
      studentDob: '2018-04-10',
      studentGender: 'Female',
      gradeApplying: 3,
      address: '123 Main Street',
      phone: '9999999999',
      familyIncome: 90000,
      previousGradePct: 84,
      previousSchool: 'Little Stars',
    });

    expect(application.id).toBe('app-1');
    expect(prismaMock.application.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
  });

  it('creates scholarship applications and stores eligibility details', async () => {
    const tx = {
      application: { create: vi.fn().mockResolvedValue({ id: 'app-2', studentName: 'Ravi' }) },
      scholarshipDetail: { create: vi.fn().mockResolvedValue({}) },
    };

    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));
    prismaMock.auditLog.create.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    const result = await createScholarshipApplication({
      parentId: 'parent-1',
      studentName: 'Ravi',
      studentDob: '2017-07-05',
      studentGender: 'Male',
      gradeApplying: 5,
      address: '45 Park Avenue',
      phone: '8888888888',
      familyIncome: 150000,
      previousGradePct: 91,
      previousSchool: 'City Public School',
      scholarshipType: 'MERIT',
      category: 'GENERAL',
      achievements: 'Top performer in class',
      bplCertificate: false,
      incomeCertificate: true,
    });

    expect(result.application.id).toBe('app-2');
    expect(result.eligibility.eligible).toBe(true);
    expect(tx.application.create).toHaveBeenCalledTimes(1);
    expect(tx.scholarshipDetail.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
  });
});