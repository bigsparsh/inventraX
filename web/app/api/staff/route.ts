import { NextRequest, NextResponse } from 'next/server';
import { getAllStaff, createStaff } from '@/actions/staff';

/**
 * GET /api/staff
 * Get all staff members
 */
export async function GET() {
  try {
    const staff = await getAllStaff();
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Get staff API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff
 * Create a new staff member
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, dob, role, image } = body;

    // Validation
    if (!name || !email || !dob || !role) {
      return NextResponse.json(
        { error: 'name, email, dob, and role are required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'MANAGER', 'STAFF'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, MANAGER, or STAFF' },
        { status: 400 }
      );
    }

    const staff = await createStaff({
      name,
      email,
      dob,
      role,
      image: image || null,
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error('Create staff API error:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
