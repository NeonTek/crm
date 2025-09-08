"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectForm } from "@/components/projects/project-form"
import { TaskList } from "@/components/tasks/task-list"
import { ArrowLeft, Calendar, User, Mail, Phone, Globe, Server, Edit } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import type { IProject } from "@/models/Project"
import type { ITask } from "@/models/Task"

interface ProjectDetails {
  project: IProject & {
    client: {
      _id: string
      name: string
      email: string
      phone: string
    }
  }
  tasks: ITask[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const [data, setData] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch project details")

      const projectData = await response.json()
      setData(projectData)
    } catch (error) {
      console.error("Error fetching project details:", error)
      toast.error("Failed to load project details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchProjectDetails()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Link href="/projects">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    )
  }

  const { project, tasks } = data

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "On Hold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const isExpiringSoon = (date: Date | undefined) => {
    if (!date) return false
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return new Date(date) <= thirtyDaysFromNow
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/projects">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <ProjectForm
          project={project}
          onSuccess={fetchProjectDetails}
          trigger={
            <Button variant="outline" className="gap-2 bg-transparent">
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            </div>
            <CardDescription>Project Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{project.description}</p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm text-muted-foreground">{project.client.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{project.client.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                  <Phone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{project.client.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(project.startDate), "MMM d, yyyy")} -{" "}
                    {format(new Date(project.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {project.domainExpiry && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
                    <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Domain Expiry</p>
                    <p
                      className={`text-sm ${isExpiringSoon(project.domainExpiry) ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}
                    >
                      {format(new Date(project.domainExpiry), "MMM d, yyyy")}
                      {isExpiringSoon(project.domainExpiry) && " (Expiring Soon)"}
                    </p>
                  </div>
                </div>
              )}

              {project.hostingExpiry && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <Server className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hosting Expiry</p>
                    <p
                      className={`text-sm ${isExpiringSoon(project.hostingExpiry) ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}
                    >
                      {format(new Date(project.hostingExpiry), "MMM d, yyyy")}
                      {isExpiringSoon(project.hostingExpiry) && " (Expiring Soon)"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks - Now using the new TaskList component */}
        <TaskList tasks={tasks} projectId={project._id} onUpdate={fetchProjectDetails} />
      </div>
    </div>
  )
}
