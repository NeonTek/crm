import { DashboardStats } from "@/components/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, ArrowRight, Building2, FolderOpen, CheckSquare, Bell } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to NeonTek CRM</h1>
        <p className="text-muted-foreground">
          Manage your clients, projects, and tasks efficiently with our comprehensive CRM system.
        </p>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Client Management
            </CardTitle>
            <CardDescription>
              Add new clients and manage their information, hosting, and domain details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/dashboard/clients">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/clients">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Project Management
            </CardTitle>
            <CardDescription>
              Create and track projects for your clients with detailed progress monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/dashboard/projects">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/projects">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Task Management
            </CardTitle>
            <CardDescription>Break down projects into manageable tasks and track their completion.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/dashboard/tasks">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/tasks">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Center
          </CardTitle>
          <CardDescription>
            Monitor domain and hosting expiry dates and send automated notifications to clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/notifications">
                Check Expiring Services
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
          <CardDescription>
            NeonTek CRM provides comprehensive tools for managing your business operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Client Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete client information tracking</li>
                <li>• Hosting and domain expiry monitoring</li>
                <li>• Service pricing and renewal tracking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Project & Task Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Project status and progress tracking</li>
                <li>• Task assignment and priority management</li>
                <li>• Budget and timeline monitoring</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Automated Notifications</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 30-day, 7-day, and 1-day expiry alerts</li>
                <li>• Professional HTML email templates</li>
                <li>• Manual and automated email sending</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Modern Interface</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Dark and light theme support</li>
                <li>• Responsive design for all devices</li>
                <li>• Intuitive navigation and search</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
