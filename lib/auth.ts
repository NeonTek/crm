import jwt from "jsonwebtoken"
import type { IUser } from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "neontek-crm-super-secret-jwt-key-2024-production"

export interface JWTPayload {
  userId: string
  email: string
  name: string
  role: string
}

export function generateToken(user: IUser): string {
  try {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }

    console.log("Generating token for user:", user.email)
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
  } catch (error) {
    console.error("Token generation error:", error)
    throw error
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Also check cookies for browser requests
  const cookieHeader = request.headers.get("cookie")
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    return cookies.token || null
  }

  return null
}
