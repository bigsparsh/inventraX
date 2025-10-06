'use server';

import { query } from '@/lib/db';
import { QueryResultRow } from 'pg';

/**
 * Product Interface
 */
export interface Product {
  product_id: string;
  name: string;
  description: string;
  category_id: string;
  category_name?: string;
  quantity: number;
  image: string | null;
}

/**
 * Category Interface
 */
export interface Category {
  category_id: string;
  name: string;
  description: string;
  created_at: Date;
}

/**
 * Get all products with category information
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const result = await query<Product>(
      `SELECT 
        p.product_id,
        p.name,
        p.description,
        p.category_id,
        c.name as category_name,
        p.quantity,
        p.image
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.category_id
      ORDER BY p.name ASC`
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const result = await query<Category>(
      `SELECT 
        category_id,
        name,
        description,
        created_at
      FROM Categories
      ORDER BY name ASC`
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: {
  name: string;
  description: string;
  category_id: string;
  quantity: number;
  image?: string | null;
}): Promise<Product> {
  try {
    const result = await query<Product>(
      `INSERT INTO Products (name, description, category_id, quantity, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        product_id,
        name,
        description,
        category_id,
        quantity,
        image`,
      [
        data.name,
        data.description,
        data.category_id,
        data.quantity,
        data.image || null,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  data: {
    name?: string;
    description?: string;
    category_id?: string;
    quantity?: number;
    image?: string | null;
  }
): Promise<Product> {
  try {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.category_id !== undefined) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(data.category_id);
    }
    if (data.quantity !== undefined) {
      updates.push(`quantity = $${paramCount++}`);
      values.push(data.quantity);
    }
    if (data.image !== undefined) {
      updates.push(`image = $${paramCount++}`);
      values.push(data.image);
    }

    values.push(productId);

    const result = await query<Product>(
      `UPDATE Products
      SET ${updates.join(', ')}
      WHERE product_id = $${paramCount}
      RETURNING 
        product_id,
        name,
        description,
        category_id,
        quantity,
        image`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Product not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const result = await query(
      'DELETE FROM Products WHERE product_id = $1',
      [productId]
    );

    if (result.rowCount === 0) {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const result = await query<Product>(
      `SELECT 
        p.product_id,
        p.name,
        p.description,
        p.category_id,
        c.name as category_name,
        p.quantity,
        p.image
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.category_id
      WHERE p.product_id = $1`,
      [productId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}
