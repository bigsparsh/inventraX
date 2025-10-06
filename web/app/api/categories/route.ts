import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories } from '@/actions/products';

/**
 * GET /api/categories
 * Get all categories
 */
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Get categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
