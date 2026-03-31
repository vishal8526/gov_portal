/**
 * ============================================================================
 * Dashboard Stats API — GET /api/dashboard
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDashboardStats } from '@/services/review.service';
import { getSeatSummary } from '@/services/seat-allocation.service';
import { getRecentActivity } from '@/services/audit.service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [stats, seatSummary, recentActivity] = await Promise.all([
      getDashboardStats(),
      getSeatSummary(),
      getRecentActivity(10),
    ]);

    return NextResponse.json({ stats, seatSummary, recentActivity });
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
