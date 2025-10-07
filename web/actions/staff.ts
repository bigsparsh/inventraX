'use server';

import { query } from '@/lib/db';

/**
 * Staff Member Interface
 */
export interface StaffMember {
  user_id: string;
  name: string;
  email: string;
  dob: string;
  image: string | null;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | null;
  role_id: string | null;
}

/**
 * Get all staff members with their roles
 */
export async function getAllStaff(): Promise<StaffMember[]> {
  try {
    const result = await query<StaffMember>(
      `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.dob,
        u.image,
        rm.role,
        rm.role_id
      FROM Users u
      LEFT JOIN RoleMapping rm ON u.user_id = rm.user_id
      ORDER BY u.name ASC`
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw new Error('Failed to fetch staff members');
  }
}

/**
 * Create a new staff member
 */
export async function createStaff(data: {
  name: string;
  email: string;
  dob: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  image?: string | null;
}): Promise<StaffMember> {
  try {
    // First create the user
    const userResult = await query<{ user_id: string }>(
      `INSERT INTO Users (name, email, dob, image)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id`,
      [data.name, data.email, data.dob, data.image || null]
    );

    const userId = userResult.rows[0].user_id;

    // Then create the role mapping
    await query(
      `INSERT INTO RoleMapping (user_id, role)
      VALUES ($1, $2::Roles)`,
      [userId, data.role]
    );

    // Return the created staff member
    const staffResult = await query<StaffMember>(
      `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.dob,
        u.image,
        rm.role,
        rm.role_id
      FROM Users u
      LEFT JOIN RoleMapping rm ON u.user_id = rm.user_id
      WHERE u.user_id = $1`,
      [userId]
    );

    return staffResult.rows[0];
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw new Error('Failed to create staff member');
  }
}

/**
 * Promote a user to a new role using stored procedure
 */
export async function promoteStaff(
  userId: string,
  newRole: 'ADMIN' | 'MANAGER' | 'STAFF'
): Promise<void> {
  try {
    await query('CALL promote_user($1, $2::Roles)', [userId, newRole]);
  } catch (error) {
    console.error('Error promoting staff:', error);
    throw new Error('Failed to promote staff member');
  }
}

/**
 * Remove a staff member using stored procedure
 * This will delete both the user and their role mapping
 */
export async function fireStaff(userId: string): Promise<void> {
  try {
    await query('CALL fire_user($1)', [userId]);
  } catch (error) {
    console.error('Error firing staff:', error);
    throw new Error('Failed to remove staff member');
  }
}

/**
 * Update staff member details (not including role)
 */
export async function updateStaff(
  userId: string,
  data: {
    name?: string;
    email?: string;
    dob?: string;
    image?: string | null;
  }
): Promise<StaffMember> {
  try {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.dob !== undefined) {
      updates.push(`dob = $${paramCount++}`);
      values.push(data.dob);
    }
    if (data.image !== undefined) {
      updates.push(`image = $${paramCount++}`);
      values.push(data.image);
    }

    values.push(userId);

    await query(
      `UPDATE Users
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}`,
      values
    );

    // Return updated staff member
    const result = await query<StaffMember>(
      `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.dob,
        u.image,
        rm.role,
        rm.role_id
      FROM Users u
      LEFT JOIN RoleMapping rm ON u.user_id = rm.user_id
      WHERE u.user_id = $1`,
      [userId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error updating staff:', error);
    throw new Error('Failed to update staff member');
  }
}
