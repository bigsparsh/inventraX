import { NextResponse } from 'next/server';
import { getCategoryDistribution } from '@/actions/dashboard';

export async function GET() {
  try {
    const distribution = await getCategoryDistribution();
    return NextResponse.json(distribution);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category distribution' },
      { status: 500 }
    );
  }
}
