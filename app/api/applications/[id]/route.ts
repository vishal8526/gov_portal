/**
 * ============================================================================
 * Single Application API — GET, PATCH for /api/applications/[id]
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getApplicationById } from '@/services/intake.service';
import { updateApplicationStatus, addStaffNote } from '@/services/review.service';
import { assignSeat } from '@/services/seat-allocation.service';

/**
 * GET /api/applications/[id] — Get application detail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Parents can only see their own applications
    const parentId = session.user.role === 'PARENT' ? session.user.id : undefined;
    const application = await getApplicationById(id, parentId);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Remove internal staff notes from parent view
    if (session.user.role === 'PARENT') {
      application.staffNotes = [];
      application.auditLogs = application.auditLogs.filter(
        (log) => log.action !== 'NOTE_ADDED'
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('GET /api/applications/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/applications/[id] — Update application (status change, notes, seat assignment)
 * Body: { action: 'status_update' | 'add_note' | 'assign_seat', ...data }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only staff/admin can perform updates
    if (session.user.role === 'PARENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'status_update': {
        const updated = await updateApplicationStatus(
          id,
          data.status,
          session.user.id,
          data.note
        );
        return NextResponse.json({ success: true, application: updated });
      }

      case 'add_note': {
        const note = await addStaffNote(
          id,
          session.user.id,
          data.content,
          data.isInternal ?? true
        );
        return NextResponse.json({ success: true, note });
      }

      case 'assign_seat': {
        const assignment = await assignSeat(id, session.user.id);
        return NextResponse.json({ success: true, assignment });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('PATCH /api/applications/[id] error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
