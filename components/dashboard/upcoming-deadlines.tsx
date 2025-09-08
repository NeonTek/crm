import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Globe, Server, AlertTriangle } from "lucide-react"
import { format, formatDistanceToNow, differenceInDays } from "date-fns"
import type { UpcomingTask, ExpiringService } from "@/lib/types"

interface UpcomingDeadlinesProps {
  tasks: UpcomingTask[]
  domains: ExpiringService[]
  hosting: ExpiringService[]
}

export function UpcomingDeadlinesCard({ tasks, domains, hosting }: UpcomingDeadlinesProps) {
  const allDeadlines = [
    ...tasks.map((task) => ({
      type: "task" as const,
      title: task.title,
      subtitle: `${task.project.name} - ${task.project.client.name}`,
      date: new Date(task.dueDate),
      status: task.status,
      id: task._id,
    })),
    ...domains.map((domain) => ({
      type: "domain" as const,
      title: `Domain: ${domain.name}`,
      subtitle: domain.client.name,
      date: new Date(domain.domainExpiry!),
      status: "expiring",
      id: domain._id,
    })),
    ...hosting.map((host) => ({
      type: "hosting" as const,
      title: `Hosting: ${host.name}`,
      subtitle: host.client.name,
      date: new Date(host.hostingExpiry!),
      status: "expiring",
      id: host._id,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  if (allDeadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Tasks and service deadlines approaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No upcoming deadlines</div>
        </CardContent>
      </Card>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "task":
        return CheckSquare
      case "domain":
        return Globe
      case "hosting":
        return Server
      default:
        return AlertTriangle
    }
  }

  const getUrgencyColor = (date: Date) => {
    const days = differenceInDays(date, new Date())
    if (days <= 1) return "text-red-500"
    if (days <= 7) return "text-orange-500"
    return "text-blue-500"
  }

  const getUrgencyBadge = (date: Date) => {
    const days = differenceInDays(date, new Date())
    if (days <= 1) return { variant: "destructive" as const, text: "Urgent" }
    if (days <= 7) return { variant: "secondary" as const, text: "Soon" }
    return { variant: "outline" as const, text: "Upcoming" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>Tasks and service deadlines approaching</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {allDeadlines.slice(0, 5).map((deadline) => {
          const Icon = getIcon(deadline.type)
          const urgencyBadge = getUrgencyBadge(deadline.date)

          return (
            <div key={`${deadline.type}-${deadline.id}`} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                  <Icon className={`h-4 w-4 ${getUrgencyColor(deadline.date)}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{deadline.title}</p>
                <p className="text-xs text-muted-foreground">{deadline.subtitle}</p>
                <p className="text-xs text-muted-foreground">
                  Due {format(deadline.date, "MMM d, yyyy")} ({formatDistanceToNow(deadline.date, { addSuffix: true })})
                </p>
              </div>
              <Badge variant={urgencyBadge.variant} className="text-xs">
                {urgencyBadge.text}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
