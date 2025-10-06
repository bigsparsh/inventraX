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
  changed_at: Date;
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
        il.changed_at
      FROM InventoryLogs il
      JOIN Products p ON il.product_id = p.product_id
      JOIN Users u ON il.changed_by = u.user_id
      ORDER BY il.changed_at DESC
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
 */
export async function getInventoryTrends() {
  try {
    const result = await query<{
      date: string;
      total_changes: string;
      increases: string;
      decreases: string;
    }>(
      `SELECT 
        DATE(changed_at) as date,
        COUNT(*)::int as total_changes,
        COUNT(CASE WHEN new_quantity > old_quantity THEN 1 END)::int as increases,
        COUNT(CASE WHEN new_quantity < old_quantity THEN 1 END)::int as decreases
      FROM InventoryLogs
      WHERE changed_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(changed_at)
      ORDER BY date DESC
      LIMIT 10`
    );

    return result.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total_changes: parseInt(row.total_changes),
      increases: parseInt(row.increases),
      decreases: parseInt(row.decreases)
    }));
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
 * Check in a product using stored procedure
 * This will automatically update inventory and create transaction log
 */
export async function checkInProduct(productId: string, userId: string): Promise<void> {
  try {
    await query(
      'CALL check_in($1, $2)',
      [productId, userId]
    );
  } catch (error) {
    console.error('Error checking in product:', error);
    throw new Error('Failed to check in product');
  }
}

/**
 * Check out a product using stored procedure
 * This will automatically update inventory, close transaction, and create log
 */
export async function checkOutProduct(productId: string, userId: string): Promise<void> {
  try {
    await query(
      'CALL check_out($1, $2)',
      [productId, userId]
    );
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
