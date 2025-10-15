'use server'

import { query } from '@/lib/db'

// ============= USERS =============
export async function getAllUsers() {
	const result = await query(`
    SELECT u.*, rm.role, rm.role_id 
    FROM Users u
    LEFT JOIN RoleMapping rm ON u.user_id = rm.user_id
    ORDER BY u.name
  `)
	return result.rows
}

export async function createUser(data: {
	name: string
	email: string
	dob: string
	image?: string
	role?: 'ADMIN' | 'MANAGER' | 'STAFF'
}) {
	const userResult = await query(
		`INSERT INTO Users (name, email, dob, image) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
		[data.name, data.email, data.dob, data.image || null]
	)

	const user = userResult.rows[0]

	if (data.role) {
		await query(
			`INSERT INTO RoleMapping (user_id, role) VALUES ($1, $2)`,
			[user.user_id, data.role]
		)
	}

	return user
}

export async function updateUser(userId: string, data: {
	name?: string
	email?: string
	dob?: string
	image?: string
}) {
	const updates: string[] = []
	const values: any[] = []
	let paramCount = 1

	if (data.name !== undefined) {
		updates.push(`name = $${paramCount}`)
		values.push(data.name)
		paramCount++
	}
	if (data.email !== undefined) {
		updates.push(`email = $${paramCount}`)
		values.push(data.email)
		paramCount++
	}
	if (data.dob !== undefined) {
		updates.push(`dob = $${paramCount}`)
		values.push(data.dob)
		paramCount++
	}
	if (data.image !== undefined) {
		updates.push(`image = $${paramCount}`)
		values.push(data.image)
		paramCount++
	}

	values.push(userId)
	const result = await query(
		`UPDATE Users SET ${updates.join(', ')} WHERE user_id = $${paramCount} RETURNING *`,
		values
	)
	return result.rows[0]
}

export async function deleteUser(userId: string) {
	await query('DELETE FROM RoleMapping WHERE user_id = $1', [userId])
	await query('DELETE FROM Users WHERE user_id = $1', [userId])
}

// ============= CATEGORIES =============
export async function getAllCategories() {
	const result = await query(`
    SELECT c.*, COUNT(p.product_id) as product_count
    FROM Categories c
    LEFT JOIN Products p ON c.category_id = p.category_id
    GROUP BY c.category_id
    ORDER BY c.name
  `)
	return result.rows
}

export async function createCategory(data: {
	name: string
	description?: string
}) {
	const result = await query(
		`INSERT INTO Categories (name, description) 
     VALUES ($1, $2) 
     RETURNING *`,
		[data.name, data.description || null]
	)
	return result.rows[0]
}

export async function updateCategory(categoryId: string, data: {
	name?: string
	description?: string
}) {
	const updates: string[] = []
	const values: any[] = []
	let paramCount = 1

	if (data.name !== undefined) {
		updates.push(`name = $${paramCount}`)
		values.push(data.name)
		paramCount++
	}
	if (data.description !== undefined) {
		updates.push(`description = $${paramCount}`)
		values.push(data.description)
		paramCount++
	}

	values.push(categoryId)
	const result = await query(
		`UPDATE Categories SET ${updates.join(', ')} WHERE category_id = $${paramCount} RETURNING *`,
		values
	)
	return result.rows[0]
}

export async function deleteCategory(categoryId: string) {
	await query('DELETE FROM Categories WHERE category_id = $1', [categoryId])
}

// ============= PRODUCTS =============
export async function getAllProductsData() {
	const result = await query(`
    SELECT p.*, c.name as category_name
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.category_id
    ORDER BY p.name
  `)
	return result.rows
}

export async function createProductData(data: {
	name: string
	description?: string
	category_id: string
	quantity?: number
	image?: string
}) {
	const result = await query(
		`INSERT INTO Products (name, description, category_id, quantity, image) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
		[data.name, data.description || null, data.category_id, data.quantity || 0, data.image || null]
	)
	return result.rows[0]
}

export async function updateProductData(productId: string, data: {
	name?: string
	description?: string
	category_id?: string
	quantity?: number
	image?: string
}) {
	const updates: string[] = []
	const values: any[] = []
	let paramCount = 1

	if (data.name !== undefined) {
		updates.push(`name = $${paramCount}`)
		values.push(data.name)
		paramCount++
	}
	if (data.description !== undefined) {
		updates.push(`description = $${paramCount}`)
		values.push(data.description)
		paramCount++
	}
	if (data.category_id !== undefined) {
		updates.push(`category_id = $${paramCount}`)
		values.push(data.category_id)
		paramCount++
	}
	if (data.quantity !== undefined) {
		updates.push(`quantity = $${paramCount}`)
		values.push(data.quantity)
		paramCount++
	}
	if (data.image !== undefined) {
		updates.push(`image = $${paramCount}`)
		values.push(data.image)
		paramCount++
	}

	values.push(productId)
	const result = await query(
		`UPDATE Products SET ${updates.join(', ')} WHERE product_id = $${paramCount} RETURNING *`,
		values
	)
	return result.rows[0]
}

export async function deleteProductData(productId: string) {
	await query('DELETE FROM Products WHERE product_id = $1', [productId])
}

// ============= TRANSACTIONS =============
export async function getAllTransactions() {
	const result = await query(`
    SELECT t.*, u.name as user_name, p.name as product_name
    FROM Transactions t
    LEFT JOIN Users u ON t.user_id = u.user_id
    LEFT JOIN Products p ON t.product_id = p.product_id
    ORDER BY t.check_in_time DESC
  `)
	return result.rows
}

export async function createTransaction(data: {
	user_id: string
	product_id: string
	check_in_time?: string
	check_out_time?: string
	current_status: 'IN' | 'OUT'
}) {
	const result = await query(
		`INSERT INTO Transactions (user_id, product_id, check_in_time, check_out_time, current_status) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
		[
			data.user_id,
			data.product_id,
			data.check_in_time || new Date().toISOString(),
			data.check_out_time || null,
			data.current_status
		]
	)
	return result.rows[0]
}

export async function updateTransaction(transactionId: string, data: {
	check_out_time?: string
	current_status?: 'IN' | 'OUT'
}) {
	const updates: string[] = []
	const values: any[] = []
	let paramCount = 1

	if (data.check_out_time !== undefined) {
		updates.push(`check_out_time = $${paramCount}`)
		values.push(data.check_out_time)
		paramCount++
	}
	if (data.current_status !== undefined) {
		updates.push(`current_status = $${paramCount}`)
		values.push(data.current_status)
		paramCount++
	}

	values.push(transactionId)
	const result = await query(
		`UPDATE Transactions SET ${updates.join(', ')} WHERE transaction_id = $${paramCount} RETURNING *`,
		values
	)
	return result.rows[0]
}

export async function deleteTransaction(transactionId: string) {
	await query('DELETE FROM Transactions WHERE transaction_id = $1', [transactionId])
}

// ============= INVENTORY LOGS =============
export async function getAllInventoryLogs() {
	const result = await query(`
    SELECT il.*, p.name as product_name, u.name as changed_by_name
    FROM InventoryLogs il
    LEFT JOIN Products p ON il.product_id = p.product_id
    LEFT JOIN Users u ON il.changed_by = u.user_id
    ORDER BY il.log_id DESC
  `)
	return result.rows
}

// Note: Inventory logs are typically auto-generated by triggers
// but we can provide manual creation for admin purposes
export async function createInventoryLog(data: {
	product_id: string
	old_quantity: number
	new_quantity: number
	changed_by: string
}) {
	const result = await query(
		`INSERT INTO InventoryLogs (product_id, old_quantity, new_quantity, changed_by) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
		[data.product_id, data.old_quantity, data.new_quantity, data.changed_by]
	)
	return result.rows[0]
}

export async function deleteInventoryLog(logId: string) {
	await query('DELETE FROM InventoryLogs WHERE log_id = $1', [logId])
}

// ============= ROLE MAPPING =============
export async function getAllRoleMappings() {
	const result = await query(`
    SELECT rm.*, u.name as user_name, u.email
    FROM RoleMapping rm
    LEFT JOIN Users u ON rm.user_id = u.user_id
    ORDER BY u.name
  `)
	return result.rows
}

export async function createRoleMapping(data: {
	user_id: string
	role: 'ADMIN' | 'MANAGER' | 'STAFF'
}) {
	const result = await query(
		`INSERT INTO RoleMapping (user_id, role) 
     VALUES ($1, $2) 
     RETURNING *`,
		[data.user_id, data.role]
	)
	return result.rows[0]
}

export async function updateRoleMapping(roleId: string, data: {
	role: 'ADMIN' | 'MANAGER' | 'STAFF'
}) {
	const result = await query(
		`UPDATE RoleMapping SET role = $1 WHERE role_id = $2 RETURNING *`,
		[data.role, roleId]
	)
	return result.rows[0]
}

export async function deleteRoleMapping(roleId: string) {
	await query('DELETE FROM RoleMapping WHERE role_id = $1', [roleId])
}
