"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, MoreVertical, Edit, Trash2, Eye, User, Globe, Server } from "lucide-react"
import { ProjectForm } from "./project-form"
import Link from "next/link"
import { format } from "date-fns"
import type { IProject } from "@/models/Project"

interface ProjectCardProps {
  project: IProject & { client: { _id: string; name: string; email: string } }
  onUpdate: () => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onUpdate, onDelete }: ProjectCardProps) {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{project.client.name}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project._id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <ProjectForm
                project={project}
                onSuccess={onUpdate}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem
                onClick={() => onDelete(project._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(project.startDate), "MMM d")} - {format(new Date(project.endDate), "MMM d, yyyy")}
          </span>
        </div>

        {(project.domainExpiry || project.hostingExpiry) && (
          <div className="space-y-1">
            {project.domainExpiry && (
              <div className="flex items-center space-x-2 text-sm">
                <Globe className="h-4 w-4" />
                <span
                  className={
                    isExpiringSoon(project.domainExpiry)
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-muted-foreground"
                  }
                >
                  Domain: {format(new Date(project.domainExpiry), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {project.hostingExpiry && (
              <div className="flex items-center space-x-2 text-sm">
                <Server className="h-4 w-4" />
                <span
                  className={
                    isExpiringSoon(project.hostingExpiry)
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-muted-foreground"
                  }
                >
                  Hosting: {format(new Date(project.hostingExpiry), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
