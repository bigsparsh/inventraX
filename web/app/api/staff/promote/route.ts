import { NextRequest, NextResponse } from 'next/server';
import { promoteUser } from '@/actions/dashboard';

/**
 * POST /api/staff/promote
 * Promote a user to a new role
 * Body: { userId: string, role: 'ADMIN' | 'MANAGER' | 'STAFF' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'MANAGER', 'STAFF'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, MANAGER, or STAFF' },
        { status: 400 }
      );
    }

    await promoteUser(userId, role);

    return NextResponse.json(
      { message: `User promoted to ${role} successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Promote user API error:', error);
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 }
    );
  }
}
