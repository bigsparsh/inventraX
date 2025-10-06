import { NextRequest, NextResponse } from 'next/server';
import { checkOutProduct } from '@/actions/dashboard';

/**
 * POST /api/inventory/check-out
 * Check out a product (removes from inventory)
 * Body: { productId: string, userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId } = body;

    if (!productId || !userId) {
      return NextResponse.json(
        { error: 'productId and userId are required' },
        { status: 400 }
      );
    }

    await checkOutProduct(productId, userId);

    return NextResponse.json(
      { message: 'Product checked out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check-out API error:', error);
    return NextResponse.json(
      { error: 'Failed to check out product' },
      { status: 500 }
    );
  }
}
