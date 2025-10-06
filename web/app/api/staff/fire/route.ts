import { NextRequest, NextResponse } from 'next/server';
import { fireUser } from '@/actions/dashboard';

/**
 * POST /api/staff/fire
 * Remove a user from the system (deletes user and role mapping)
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await fireUser(userId);

    return NextResponse.json(
      { message: 'User removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fire user API error:', error);
    return NextResponse.json(
      { error: 'Failed to remove user' },
      { status: 500 }
    );
  }
}
