import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  dob: z.string().min(1),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional().default('STAFF'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT user_id FROM Users WHERE email = $1',
      [validatedData.email]
    )
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user
    const userResult = await query(
      `INSERT INTO Users (name, email, password, dob, image) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING user_id, name, email, dob`,
      [validatedData.name, validatedData.email, hashedPassword, validatedData.dob, null]
    )
    
    const user = userResult.rows[0]
    
    // Create role mapping
    const roleResult = await query(
      `INSERT INTO RoleMapping (user_id, role) 
       VALUES ($1, $2) 
       RETURNING role`,
      [user.user_id, validatedData.role]
    )
    
    const role = roleResult.rows[0].role
    
    // Generate JWT token
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      role: role,
      name: user.name,
    })
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        role: role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
