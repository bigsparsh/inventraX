import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { comparePassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Find user with role
    const userResult = await query(
      `SELECT u.user_id, u.name, u.email, u.password, u.dob, u.image, rm.role
       FROM Users u
       LEFT JOIN RoleMapping rm ON u.user_id = rm.user_id
       WHERE u.email = $1`,
      [validatedData.email]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    const user = userResult.rows[0]
    
    // Check if user has a password (might be null for some users)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Account not set up with password. Please contact administrator.' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check if user has a role assigned
    if (!user.role) {
      return NextResponse.json(
        { error: 'No role assigned. Please contact administrator.' },
        { status: 403 }
      )
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role,
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
        image: user.image,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
