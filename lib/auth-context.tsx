"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      console.log("[v0] Refreshing user session...")
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Refresh response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] User data received:", data)
        setUser(data.user)
      } else {
        console.log("[v0] No valid session found")
        setUser(null)
      }
    } catch (error) {
      console.error("[v0] Error refreshing user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Attempting login for:", email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] Login response status:", response.status)

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("[v0] Failed to parse login response as JSON:", parseError)
        throw new Error("Server error - please try again later")
      }

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      setUser(data.user)
      toast.success("Login successful")
      window.location.href = "/"
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      toast.error(error.message || "Login failed")
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("[v0] Attempting registration for:", email)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      console.log("[v0] Registration response status:", response.status)

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("[v0] Failed to parse registration response as JSON:", parseError)
        throw new Error("Server error - please try again later")
      }

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setUser(data.user)
      toast.success("Registration successful")
      window.location.href = "/"
    } catch (error: any) {
      console.error("[v0] Registration error:", error)
      toast.error(error.message || "Registration failed")
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      toast.error("Logout failed")
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
