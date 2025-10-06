import { NextRequest, NextResponse } from 'next/server';
import { getRecentTransactions } from '@/actions/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const transactions = await getRecentTransactions(limit);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent transactions' },
      { status: 500 }
    );
  }
}
