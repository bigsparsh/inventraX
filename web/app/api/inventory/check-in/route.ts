import { NextRequest, NextResponse } from 'next/server';
import { checkInProduct } from '@/actions/dashboard';

/**
 * POST /api/inventory/check-in
 * Check in a product (adds to inventory)
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

    await checkInProduct(productId, userId);

    return NextResponse.json(
      { message: 'Product checked in successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json(
      { error: 'Failed to check in product' },
      { status: 500 }
    );
  }
}
