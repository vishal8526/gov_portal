/**
 * ============================================================================
 * Utility Functions
 * ============================================================================
 * Shared helper functions used across the application for formatting,
 * date handling, priority calculation, and other common operations.
 * ============================================================================
 */

/**
 * Formats a date object or string into a human-readable format.
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options for customization
 * @returns Formatted date string (e.g., "Mar 15, 2025")
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', options).format(d);
}

/**
 * Formats a number as Indian Rupee currency.
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "₹1,50,000")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates a priority score for an application based on multiple factors.
 * Higher scores indicate higher priority for review.
 *
 * Scoring factors:
 * - Income below poverty line: +30 points
 * - Reserved category (SC/ST/EWS): +20 points
 * - High academic performance (>80%): +15 points
 * - Scholarship application: +10 points
 * - Early submission bonus: up to +10 points
 *
 * @param params - Application parameters for scoring
 * @returns Priority score (0-100)
 */
export function calculatePriorityScore(params: {
  familyIncome?: number | null;
  category?: string | null;
  previousGradePct?: number | null;
  type: string;
  submittedAt: Date;
}): number {
  let score = 0;

  // Income-based priority (below ₹2,50,000 is high priority)
  if (params.familyIncome !== null && params.familyIncome !== undefined) {
    if (params.familyIncome < 100000) score += 30;
    else if (params.familyIncome < 250000) score += 20;
    else if (params.familyIncome < 500000) score += 10;
  }

  // Reserved category priority
  if (params.category) {
    const highPriority = ['SC', 'ST', 'EWS'];
    if (highPriority.includes(params.category)) score += 20;
    else if (params.category === 'OBC') score += 10;
  }

  // Academic performance bonus
  if (params.previousGradePct !== null && params.previousGradePct !== undefined) {
    if (params.previousGradePct >= 90) score += 15;
    else if (params.previousGradePct >= 80) score += 10;
    else if (params.previousGradePct >= 70) score += 5;
  }

  // Scholarship applications get slight boost
  if (params.type === 'SCHOLARSHIP') score += 10;

  // Early submission bonus (decays over time)
  const daysSinceSubmission = Math.floor(
    (Date.now() - params.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  score += Math.max(0, 10 - daysSinceSubmission);

  return Math.min(100, score);
}

/**
 * Returns the appropriate CSS class name for a given application status.
 * Used for consistent status badge styling across the UI.
 * @param status - Application status string
 * @returns CSS class name for the status badge
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'badge-draft',
    SUBMITTED: 'badge-submitted',
    UNDER_REVIEW: 'badge-review',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
    WAITLISTED: 'badge-waitlisted',
    ASSIGNED: 'badge-approved',
    CONFIRMED: 'badge-approved',
    RELEASED: 'badge-rejected',
  };
  return colors[status] || 'badge-default';
}

/**
 * Formats a status enum value into a human-readable label.
 * @param status - Raw status string (e.g., "UNDER_REVIEW")
 * @returns Formatted label (e.g., "Under Review")
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generates initials from a full name for avatar display.
 * @param name - Full name string
 * @returns 1-2 character initials (e.g., "RK" for "Rahul Kumar")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Computes relative time from a given date (e.g., "2 hours ago").
 * @param date - Date to compute relative time from
 * @returns Human-readable relative time string
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];

  for (const [secs, label] of intervals) {
    const interval = Math.floor(seconds / secs);
    if (interval >= 1) {
      return `${interval} ${label}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

/**
 * Checks scholarship eligibility based on application criteria.
 * Returns a structured result with eligibility status and reasoning.
 *
 * @param params - Scholarship application parameters
 * @returns Object with eligible flag, score, and detailed notes
 */
export function checkScholarshipEligibility(params: {
  scholarshipType: string;
  familyIncome: number;
  previousGradePct?: number | null;
  category?: string | null;
  bplCertificate: boolean;
  incomeCertificate: boolean;
}): { eligible: boolean; score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;
  let eligible = true;

  switch (params.scholarshipType) {
    case 'MERIT':
      // Merit scholarships require >80% in previous grade
      if (params.previousGradePct && params.previousGradePct >= 80) {
        score += 40;
        notes.push(`Academic score ${params.previousGradePct}% meets merit threshold (≥80%)`);
      } else {
        eligible = false;
        notes.push(`Academic score ${params.previousGradePct || 'N/A'}% below merit threshold (≥80%)`);
      }
      break;

    case 'NEED_BASED':
      // Need-based requires income below ₹2.5 LPA and income certificate
      if (params.familyIncome <= 250000) {
        score += 30;
        notes.push(`Family income ₹${params.familyIncome.toLocaleString()} is within threshold (≤₹2,50,000)`);
      } else {
        eligible = false;
        notes.push(`Family income ₹${params.familyIncome.toLocaleString()} exceeds threshold (≤₹2,50,000)`);
      }
      if (!params.incomeCertificate) {
        eligible = false;
        notes.push('Income certificate is required for need-based scholarship');
      } else {
        score += 10;
        notes.push('Income certificate provided');
      }
      break;

    case 'SPORTS':
      // Sports scholarships require achievements documentation
      score += 20;
      notes.push('Sports scholarship — achievements will be verified by review committee');
      break;

    case 'SPECIAL_CATEGORY':
      // Special category for SC/ST/EWS
      const specialCategories = ['SC', 'ST', 'EWS'];
      if (params.category && specialCategories.includes(params.category)) {
        score += 30;
        notes.push(`Category ${params.category} qualifies for special category scholarship`);
      } else {
        eligible = false;
        notes.push(`Category ${params.category || 'GENERAL'} does not qualify for special category scholarship`);
      }
      if (params.bplCertificate) {
        score += 10;
        notes.push('BPL certificate provided — additional priority granted');
      }
      break;
  }

  // Cross-cutting bonus factors
  if (params.bplCertificate) score += 5;
  if (params.familyIncome < 100000) {
    score += 10;
    notes.push('Extra priority: Family income below ₹1,00,000');
  }

  return { eligible, score: Math.min(100, score), notes };
}

/**
 * Truncates a string to a maximum length with ellipsis.
 * @param str - String to truncate
 * @param maxLength - Maximum allowable length
 * @returns Truncated string with "..." appended if needed
 */
export function truncate(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
