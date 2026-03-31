import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  seatAllocation: { upsert: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  application: { findUnique: vi.fn() },
  seatAssignment: { findUnique: vi.fn(), create: vi.fn() },
  auditLog: { create: vi.fn() },
  notification: { create: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { getCurrentAcademicYear, upsertSeatAllocation } from '@/services/seat-allocation.service';

describe('seat allocation service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('returns the correct academic year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-31T10:00:00.000Z'));
    expect(getCurrentAcademicYear()).toBe('2025-26');
  });

  it('upserts a seat allocation', async () => {
    prismaMock.seatAllocation.upsert.mockResolvedValue({ id: 'seat-1', grade: 4, totalSeats: 40, academicYear: '2025-26' });

    const allocation = await upsertSeatAllocation(4, 40, '2025-26');

    expect(allocation.id).toBe('seat-1');
    expect(prismaMock.seatAllocation.upsert).toHaveBeenCalledWith({
      where: { grade_academicYear: { grade: 4, academicYear: '2025-26' } },
      update: { totalSeats: 40 },
      create: { grade: 4, totalSeats: 40, academicYear: '2025-26' },
    });
  });
});