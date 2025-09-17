"use client"

import { useState, useEffect } from "react"
import { getUser, type User } from "@/lib/auth"
import { DashboardSidebar } from "./dashboard-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile Menu */}
        {/* <div className="lg:hidden">
          <DashboardSidebar />
        </div> */}

        {/* Spacer for desktop */}
        <div className="hidden lg:block lg:w-64" />

        {/* Header Content */}
        <div className="flex flex-1 items-center justify-between">
          <div className="flex-1" />

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
