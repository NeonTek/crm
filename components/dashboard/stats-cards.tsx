import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, FolderOpen, CheckSquare, AlertTriangle } from "lucide-react"
import type { DashboardMetrics } from "@/lib/types"

interface StatsCardsProps {
  metrics: DashboardMetrics
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Clients",
      value: metrics.totalClients,
      description:
        metrics.totalClients === 0
          ? "No clients yet"
          : `${metrics.totalClients} client${metrics.totalClients !== 1 ? "s" : ""} registered`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Projects",
      value: metrics.activeProjects,
      description:
        metrics.activeProjects === 0
          ? "No active projects"
          : `${metrics.activeProjects} project${metrics.activeProjects !== 1 ? "s" : ""} in progress`,
      icon: FolderOpen,
      color: "text-green-500",
    },
    {
      title: "Tasks Due This Week",
      value: metrics.tasksDueThisWeek,
      description:
        metrics.tasksDueThisWeek === 0
          ? "No tasks due this week"
          : `${metrics.tasksDueThisWeek} task${metrics.tasksDueThisWeek !== 1 ? "s" : ""} need attention`,
      icon: CheckSquare,
      color: metrics.tasksDueThisWeek > 0 ? "text-orange-500" : "text-gray-500",
    },
    {
      title: "Expiring Services",
      value: metrics.expiringServices,
      description:
        metrics.expiringServices === 0
          ? "No services expiring soon"
          : `${metrics.expiringServices} service${metrics.expiringServices !== 1 ? "s" : ""} expiring within 30 days`,
      icon: metrics.expiringServices > 0 ? AlertTriangle : Building2,
      color: metrics.expiringServices > 0 ? "text-red-500" : "text-gray-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
