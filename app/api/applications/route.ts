/**
 * ============================================================================
 * Applications API — CRUD operations for applications
 * ============================================================================
 * GET /api/applications — List applications (filtered by role)
 * POST /api/applications — Create new application
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { admissionSchema, scholarshipSchema } from '@/lib/validators';
import {
  createAdmissionApplication,
  createScholarshipApplication,
  getParentApplications,
} from '@/services/intake.service';
import { getReviewQueue } from '@/services/review.service';

/**
 * GET /api/applications
 * Parents see their own applications; staff sees the review queue
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    if (session.user.role === 'PARENT') {
      // Parents see only their applications
      const applications = await getParentApplications(session.user.id);
      return NextResponse.json({ applications });
    } else {
      // Staff/Admin see the review queue with filters
      const filters = {
        status: searchParams.get('status') || undefined,
        type: searchParams.get('type') || undefined,
        grade: searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined,
        search: searchParams.get('search') || undefined,
        sortBy: searchParams.get('sortBy') || undefined,
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
        pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined,
      };
      const result = await getReviewQueue(filters);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/applications
 * Creates a new admission or scholarship application
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Only parents can submit applications' }, { status: 403 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'ADMISSION') {
      // Validate admission application
      const result = admissionSchema.safeParse(data);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const application = await createAdmissionApplication({
        ...result.data,
        parentId: session.user.id,
      });

      return NextResponse.json({ success: true, application }, { status: 201 });
    } else if (type === 'SCHOLARSHIP') {
      // Validate scholarship application
      const result = scholarshipSchema.safeParse(data);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { application, eligibility } = await createScholarshipApplication({
        ...result.data,
        parentId: session.user.id,
      });

      return NextResponse.json({ success: true, application, eligibility }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Invalid application type' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
