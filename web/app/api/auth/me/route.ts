import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }
    
    // Verify token
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Fetch fresh user data from database
    const userResult = await query(
      `SELECT u.user_id, u.name, u.email, u.dob, u.image, rm.role
       FROM Users u
       LEFT JOIN RoleMapping rm ON u.user_id = rm.user_id
       WHERE u.user_id = $1`,
      [payload.userId]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const user = userResult.rows[0]
    
    return NextResponse.json({
      success: true,
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
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    )
  }
}
