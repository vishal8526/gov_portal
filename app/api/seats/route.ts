/**
 * ============================================================================
 * Seats API — Seat allocation management
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { seatAllocationSchema } from '@/lib/validators';
import {
  getSeatAllocations,
  upsertSeatAllocation,
  getSeatSummary,
  getCurrentAcademicYear,
} from '@/services/seat-allocation.service';

/**
 * GET /api/seats — Get seat allocations for current academic year
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const academicYear = getCurrentAcademicYear();
    const allocations = await getSeatAllocations(academicYear);
    const summary = await getSeatSummary();

    return NextResponse.json({ allocations, summary, academicYear });
  } catch (error) {
    console.error('GET /api/seats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/seats — Create or update seat allocation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role === 'PARENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = seatAllocationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const allocation = await upsertSeatAllocation(
      result.data.grade,
      result.data.totalSeats,
      result.data.academicYear
    );

    return NextResponse.json({ success: true, allocation });
  } catch (error) {
    console.error('POST /api/seats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
