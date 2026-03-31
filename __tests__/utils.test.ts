import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculatePriorityScore, checkScholarshipEligibility } from '@/lib/utils';
import { getCurrentAcademicYear } from '@/services/seat-allocation.service';

describe('utility helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates higher priority for lower-income scholarship applicants', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-31T00:00:00.000Z'));

    const score = calculatePriorityScore({
      familyIncome: 90000,
      category: 'SC',
      previousGradePct: 92,
      type: 'SCHOLARSHIP',
      submittedAt: new Date('2026-03-30T00:00:00.000Z'),
    });

    expect(score).toBeGreaterThanOrEqual(70);
  });

  it('evaluates need-based scholarship eligibility', () => {
    const result = checkScholarshipEligibility({
      scholarshipType: 'NEED_BASED',
      familyIncome: 180000,
      previousGradePct: 78,
      category: 'OBC',
      bplCertificate: false,
      incomeCertificate: true,
    });

    expect(result.eligible).toBe(true);
    expect(result.score).toBeGreaterThan(0);
    expect(result.notes.join(' ')).toContain('Income certificate provided');
  });

  it('returns the correct academic year around april', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-31T10:00:00.000Z'));
    expect(getCurrentAcademicYear()).toBe('2025-26');

    vi.setSystemTime(new Date('2026-04-01T10:00:00.000Z'));
    expect(getCurrentAcademicYear()).toBe('2026-27');
  });
});