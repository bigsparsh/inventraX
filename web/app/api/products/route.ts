import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllProducts, 
  createProduct, 
  getAllCategories 
} from '@/actions/products';

/**
 * GET /api/products
 * Get all products
 */
export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Get products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category_id, quantity, image } = body;

    // Validation
    if (!name || !category_id) {
      return NextResponse.json(
        { error: 'name and category_id are required' },
        { status: 400 }
      );
    }

    const product = await createProduct({
      name,
      description: description || '',
      category_id,
      quantity: quantity || 0,
      image: image || null,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product API error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
