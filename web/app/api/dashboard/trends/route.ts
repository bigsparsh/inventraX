import { NextResponse } from 'next/server';
import { getTransactionTrends } from '@/actions/dashboard';

export async function GET() {
  try {
    const trends = await getTransactionTrends();
    return NextResponse.json(trends);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction trends' },
      { status: 500 }
    );
  }
}
