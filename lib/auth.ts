export interface User {
  id: string
  email: string
  name: string
}

export const AUTH_KEY = "neontek_crm_user"

export function setUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  }
}

export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  }
  return null
}

export function removeUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}

export const DEMO_CREDENTIALS = {
  email: process.env.NEONTEK_ADMIN_EMAIL || "admin@neontek.co.ke",
  password: process.env.NEONTEK_ADMIN_PASS || "admin123",
  user: {
    id: "1",
    email: process.env.NEONTEK_ADMIN_EMAIL || "admin@neontek.co.ke",
    name: process.env.NEONTEK_ADMIN_NAME || "NeonTek Admin",
  },
};
