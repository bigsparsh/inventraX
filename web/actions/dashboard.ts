'use server';

import { query } from '@/lib/db';
import { QueryResultRow } from 'pg';

/**
 * Dashboard Statistics Interface
 */
export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  lowStockCount: number;
}

/**
 * Category Distribution Interface
 */
export interface CategoryDistribution {
  category_name: string;
  product_count: number;
}

/**
 * Recent Transaction Interface
 */
export interface RecentTransaction {
  transaction_id: string;
  user_name: string;
  product_name: string;
  current_status: string;
  check_in_time: Date;
  check_out_time: Date | null;
}

/**
 * Inventory Log Interface
 */
export interface InventoryLog {
  log_id: string;
  product_name: string;
  old_quantity: number;
  new_quantity: number;
  changed_by_name: string;
  changed_at: string; // Generated on query, not stored in DB
}

/**
 * Get dashboard statistics using database views
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Use database views for efficient counting
    const productsResult = await query<{ total: string }>(
      'SELECT * FROM total_products'
    );

    const usersResult = await query<{ total: string }>(
      'SELECT * FROM total_users'
    );

    const categoriesResult = await query<{ total: string }>(
      'SELECT * FROM total_categories'
    );

    // Get low stock count using the low_stock_alert view
    const lowStockResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM low_stock_alert'
    );

    return {
      totalProducts: parseInt(productsResult.rows[0].total),
      totalUsers: parseInt(usersResult.rows[0].total),
      totalCategories: parseInt(categoriesResult.rows[0].total),
      lowStockCount: parseInt(lowStockResult.rows[0].count),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

/**
 * Get category distribution for pie chart using database view
 */
export async function getCategoryDistribution(): Promise<CategoryDistribution[]> {
  try {
    const result = await query<CategoryDistribution>(
      `SELECT 
        category_name,
        product_count::int as product_count
      FROM product_categories_pie_chart
      ORDER BY product_count DESC`
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    throw new Error('Failed to fetch category distribution');
  }
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
  try {
    const result = await query<RecentTransaction>(
      `SELECT 
        t.transaction_id,
        u.name as user_name,
        p.name as product_name,
        t.current_status,
        t.check_in_time,
        t.check_out_time
      FROM Transactions t
      JOIN Users u ON t.user_id = u.user_id
      JOIN Products p ON t.product_id = p.product_id
      ORDER BY t.check_in_time DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw new Error('Failed to fetch recent transactions');
  }
}

/**
 * Get recent inventory logs
 */
export async function getRecentInventoryLogs(limit: number = 10): Promise<InventoryLog[]> {
  try {
    const result = await query<InventoryLog>(
      `SELECT 
        il.log_id,
        p.name as product_name,
        il.old_quantity,
        il.new_quantity,
        u.name as changed_by_name,
        NOW() as changed_at
      FROM InventoryLogs il
      JOIN Products p ON il.product_id = p.product_id
      JOIN Users u ON il.changed_by = u.user_id
      ORDER BY il.log_id DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    throw new Error('Failed to fetch inventory logs');
  }
}

/**
 * Get low stock products using database view
 * Note: The view low_stock_alert uses quantity < 10 as threshold
 */
export async function getLowStockProducts(threshold: number = 20) {
  try {
    // If threshold is 10 or less, use the view for better performance
    if (threshold <= 10) {
      const result = await query(
        `SELECT 
          product_id,
          name,
          quantity,
          category_id
        FROM low_stock_alert
        ORDER BY quantity ASC`
      );
      
      // Get category names for the products
      const enrichedResults = await query(
        `SELECT 
          p.product_id,
          p.name,
          p.quantity,
          c.name as category_name
        FROM low_stock_alert p
        LEFT JOIN Categories c ON p.category_id = c.category_id
        ORDER BY p.quantity ASC`
      );
      
      return enrichedResults.rows;
    } else {
      // For custom thresholds, use parameterized query
      const result = await query(
        `SELECT 
          p.product_id,
          p.name,
          p.quantity,
          c.name as category_name
        FROM Products p
        LEFT JOIN Categories c ON p.category_id = c.category_id
        WHERE p.quantity < $1
        ORDER BY p.quantity ASC
        LIMIT 10`,
        [threshold]
      );
      
      return result.rows;
    }
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw new Error('Failed to fetch low stock products');
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId?: string) {
  try {
    let queryText = `
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.quantity,
        c.name as category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.category_id
    `;
    
    const params: any[] = [];
    
    if (categoryId) {
      queryText += ' WHERE p.category_id = $1';
      params.push(categoryId);
    }
    
    queryText += ' ORDER BY p.name ASC';

    const result = await query(queryText, params.length > 0 ? params : undefined);
    return result.rows;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats() {
  try {
    // Get total transactions
    const totalResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM Transactions'
    );

    // Get active transactions (IN status)
    const activeResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM Transactions WHERE current_status = 'IN'"
    );

    // Get completed transactions (OUT status)
    const completedResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM Transactions WHERE current_status = 'OUT'"
    );

    return {
      total: parseInt(totalResult.rows[0].count),
      active: parseInt(activeResult.rows[0].count),
      completed: parseInt(completedResult.rows[0].count),
    };
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw new Error('Failed to fetch transaction statistics');
  }
}

/**
 * Get transaction trends (last 7 days)
 */
export async function getTransactionTrends() {
  try {
    const result = await query<{
      day: string;
      check_ins: string;
      check_outs: string;
    }>(
      `SELECT 
        TO_CHAR(DATE(check_in_time), 'Day') as day,
        COUNT(CASE WHEN current_status = 'IN' THEN 1 END)::int as check_ins,
        COUNT(CASE WHEN current_status = 'OUT' THEN 1 END)::int as check_outs
      FROM Transactions
      WHERE check_in_time >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(check_in_time), TO_CHAR(DATE(check_in_time), 'Day')
      ORDER BY DATE(check_in_time) ASC
      LIMIT 7`
    );

    return result.rows.map(row => ({
      day: row.day.trim(),
      check_ins: parseInt(row.check_ins),
      check_outs: parseInt(row.check_outs)
    }));
  } catch (error) {
    console.error('Error fetching transaction trends:', error);
    throw new Error('Failed to fetch transaction trends');
  }
}

/**
 * Get inventory changes over time (last 30 days)
 * Note: Since InventoryLogs doesn't have changed_at, we use log_id as proxy for recency
 */
export async function getInventoryTrends() {
  try {
    const result = await query<{
      log_id: string;
      old_quantity: string;
      new_quantity: string;
    }>(
      `SELECT 
        log_id,
        old_quantity::int as old_quantity,
        new_quantity::int as new_quantity
      FROM InventoryLogs
      ORDER BY log_id DESC
      LIMIT 10`
    );

    // Group by increase/decrease trends
    const increases = result.rows.filter(row => parseInt(row.new_quantity) > parseInt(row.old_quantity)).length;
    const decreases = result.rows.filter(row => parseInt(row.new_quantity) < parseInt(row.old_quantity)).length;

    return [{
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total_changes: result.rows.length,
      increases: increases,
      decreases: decreases
    }];
  } catch (error) {
    console.error('Error fetching inventory trends:', error);
    throw new Error('Failed to fetch inventory trends');
  }
}

/**
 * ============================================================================
 * STORED PROCEDURE WRAPPERS
 * ============================================================================
 */

/**
 * Check in a product by directly inserting transaction
 * The trigger will automatically update inventory and create log
 */
export async function checkInProduct(productId: string, userId: string): Promise<void> {
  try {
    // Insert transaction directly - trigger handles quantity update and logging
    await query(
      `INSERT INTO Transactions (check_in_time, current_status, user_id, product_id) 
       VALUES (NOW(), 'IN', $1, $2)`,
      [userId, productId]
    );
  } catch (error) {
    console.error('Error checking in product:', error);
    throw new Error('Failed to check in product');
  }
}

/**
 * Check out a product by updating the most recent IN transaction
 * The trigger will automatically update inventory and create log
 */
export async function checkOutProduct(productId: string, userId: string): Promise<void> {
  try {
    // Find and update the most recent IN transaction for this product
    // Note: We don't match user_id to allow any staff to check out any product
    const result = await query(
      `UPDATE Transactions 
       SET check_out_time = NOW(), current_status = 'OUT' 
       WHERE transaction_id = (
         SELECT transaction_id 
         FROM Transactions 
         WHERE product_id = $1 AND current_status = 'IN' 
         ORDER BY check_in_time DESC 
         LIMIT 1
       )
       RETURNING transaction_id`,
      [productId]
    );
    
    if (result.rowCount === 0) {
      throw new Error('No active check-in found for this product');
    }
  } catch (error) {
    console.error('Error checking out product:', error);
    throw new Error('Failed to check out product');
  }
}

/**
 * Promote a user to a new role using stored procedure
 */
export async function promoteUser(userId: string, newRole: 'ADMIN' | 'MANAGER' | 'STAFF'): Promise<void> {
  try {
    await query(
      'CALL promote_user($1, $2::Roles)',
      [userId, newRole]
    );
  } catch (error) {
    console.error('Error promoting user:', error);
    throw new Error('Failed to promote user');
  }
}

/**
 * Remove a user from the system using stored procedure
 * This will delete both role mapping and user record
 */
export async function fireUser(userId: string): Promise<void> {
  try {
    await query(
      'CALL fire_user($1)',
      [userId]
    );
  } catch (error) {
    console.error('Error firing user:', error);
    throw new Error('Failed to remove user');
  }
}
