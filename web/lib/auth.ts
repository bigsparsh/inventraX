import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Use environment variable or default secret (change in production!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // Token expires in 7 days

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
  name: string
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare password with hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Check if user has required role
 */
export function hasRole(
  userRole: 'ADMIN' | 'MANAGER' | 'STAFF',
  requiredRoles: ('ADMIN' | 'MANAGER' | 'STAFF')[]
): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Check if user has permission for action
 */
export function hasPermission(
  userRole: 'ADMIN' | 'MANAGER' | 'STAFF',
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const permissions = {
    ADMIN: ['create', 'read', 'update', 'delete'],
    MANAGER: ['create', 'read', 'update', 'delete'],
    STAFF: ['read'], // Staff can only view data
  }
  
  return permissions[userRole].includes(action)
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
