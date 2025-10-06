import { NextRequest, NextResponse } from 'next/server';
import { getLowStockProducts } from '@/actions/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const threshold = parseInt(searchParams.get('threshold') || '20');

    const products = await getLowStockProducts(threshold);
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock products' },
      { status: 500 }
    );
  }
}
