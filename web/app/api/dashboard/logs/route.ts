import { NextRequest, NextResponse } from 'next/server';
import { getRecentInventoryLogs } from '@/actions/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const logs = await getRecentInventoryLogs(limit);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory logs' },
      { status: 500 }
    );
  }
}
