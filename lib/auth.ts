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
  email: "admin@neontek.co.ke",
  password: "admin123",
  user: {
    id: "1",
    email: "admin@neontek.co.ke",
    name: "NeonTek Admin",
  },
}
