import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FolderOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { RecentActivity } from "@/lib/types"

interface RecentActivityProps {
  activities: RecentActivity[]
}

export function RecentActivityCard({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes in your CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No recent activity to display</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and changes in your CRM</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {activity.type === "client" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <FolderOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {activity.type}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
