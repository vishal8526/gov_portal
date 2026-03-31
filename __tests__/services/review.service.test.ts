import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  application: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), update: vi.fn(), groupBy: vi.fn() },
  auditLog: { create: vi.fn() },
  staffNote: { create: vi.fn() },
  notification: { create: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { getReviewQueue, updateApplicationStatus } from '@/services/review.service';

describe('review service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a paginated review queue with filters', async () => {
    prismaMock.application.findMany.mockResolvedValue([{ id: 'app-1', studentName: 'Asha' }]);
    prismaMock.application.count.mockResolvedValue(1);

    const result = await getReviewQueue({ status: 'SUBMITTED', grade: 3, page: 2, pageSize: 10, search: 'Asha' });

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(prismaMock.application.findMany).toHaveBeenCalledTimes(1);
  });

  it('updates application status and writes audit + notification records', async () => {
    prismaMock.application.findUnique.mockResolvedValue({
      id: 'app-1',
      status: 'SUBMITTED',
      assignedReviewerId: null,
      parentId: 'parent-1',
      studentName: 'Asha',
    });

    const tx = {
      application: { update: vi.fn().mockResolvedValue({ id: 'app-1', status: 'UNDER_REVIEW' }) },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
      staffNote: { create: vi.fn().mockResolvedValue({}) },
      notification: { create: vi.fn().mockResolvedValue({}) },
    };

    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    const updated = await updateApplicationStatus('app-1', 'UNDER_REVIEW', 'staff-1', 'Queued for review');

    expect(updated.status).toBe('UNDER_REVIEW');
    expect(tx.application.update).toHaveBeenCalledTimes(1);
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
    expect(tx.staffNote.create).toHaveBeenCalledTimes(1);
    expect(tx.notification.create).toHaveBeenCalledTimes(1);
  });
});