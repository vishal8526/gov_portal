/**
 * ============================================================================
 * Bulk Actions API — POST /api/applications/bulk
 * ============================================================================
 * Allows staff to perform batch operations on multiple applications.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { bulkActionSchema } from '@/lib/validators';
import { bulkUpdateStatus } from '@/services/review.service';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role === 'PARENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = bulkActionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { applicationIds, action, note } = result.data;
    const results = await bulkUpdateStatus(applicationIds, action, session.user.id, note);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('POST /api/applications/bulk error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
