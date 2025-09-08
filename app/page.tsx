"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivityCard } from "@/components/dashboard/recent-activity"
import { UpcomingDeadlinesCard } from "@/components/dashboard/upcoming-deadlines"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { DashboardData } from "@/lib/types"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async (showToast = false) => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/dashboard")
      if (!response.ok) throw new Error("Failed to fetch dashboard data")

      const dashboardData = await response.json()
      setData(dashboardData)

      if (showToast) {
        toast.success("Dashboard refreshed successfully")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Loading your CRM overview...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-red-500">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Neontek CRM - Manage your clients, projects, and tasks efficiently.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards metrics={data.metrics} />

      {/* Recent Activity and Upcoming Deadlines */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivityCard activities={data.recentActivity} />
        <UpcomingDeadlinesCard
          tasks={data.upcomingDeadlines.tasks}
          domains={data.upcomingDeadlines.domains}
          hosting={data.upcomingDeadlines.hosting}
        />
      </div>
    </div>
  )
}
