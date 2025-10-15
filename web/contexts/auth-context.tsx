"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  userId: string
  name: string
  email: string
  dob: string
  image?: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    password: string
    dob: string
    role?: 'ADMIN' | 'MANAGER' | 'STAFF'
  }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  hasPermission: (action: 'create' | 'read' | 'update' | 'delete') => boolean
  isRole: (role: 'ADMIN' | 'MANAGER' | 'STAFF') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      // Fetch user data
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        // Token invalid, clear it
        localStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('auth_token', data.token)
  }

  const register = async (registerData: {
    name: string
    email: string
    password: string
    dob: string
    role?: 'ADMIN' | 'MANAGER' | 'STAFF'
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Registration failed')
    }

    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('auth_token', data.token)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }

  const hasPermission = (action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!user) return false

    const permissions = {
      ADMIN: ['create', 'read', 'update', 'delete'],
      MANAGER: ['create', 'read', 'update', 'delete'],
      STAFF: ['read'],
    }

    return permissions[user.role].includes(action)
  }

  const isRole = (role: 'ADMIN' | 'MANAGER' | 'STAFF'): boolean => {
    return user?.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
        hasPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
