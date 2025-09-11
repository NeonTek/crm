"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderOpen, CheckSquare, AlertTriangle } from "lucide-react"

interface Stats {
  totalClients: number
  totalProjects: number
  totalTasks: number
  unreadNotifications: number
  activeProjects: number
  completedTasks: number
  expiringServices: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalProjects: 0,
    totalTasks: 0,
    unreadNotifications: 0,
    activeProjects: 0,
    completedTasks: 0,
    expiringServices: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()

    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      loadStats()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }
      const statsData = await response.json()
      setStats(statsData)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStats = () => {
    loadStats()
  }

  useEffect(() => {
    ;(window as any).refreshDashboardStats = refreshStats
    return () => {
      delete (window as any).refreshDashboardStats
    }
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground">Active client accounts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <p className="text-xs text-muted-foreground">{stats.totalProjects} total projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedTasks}</div>
          <p className="text-xs text-muted-foreground">{stats.totalTasks} total tasks</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Services</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.expiringServices}</div>
          <p className="text-xs text-muted-foreground">Within 30 days</p>
        </CardContent>
      </Card>
    </div>
  )
}
