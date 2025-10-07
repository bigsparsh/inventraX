import { NextRequest, NextResponse } from 'next/server';
import { updateStaff } from '@/actions/staff';

/**
 * PUT /api/staff/[id]
 * Update a staff member's details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const staff = await updateStaff(id, body);

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Update staff API error:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}
