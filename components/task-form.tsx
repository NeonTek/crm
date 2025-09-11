"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, Project, Client } from "@/lib/types"
import { X } from "lucide-react"

interface TaskFormProps {
  task?: Task
  onSuccess: () => void
  onCancel: () => void
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    projectId: task?.projectId || "",
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    assignedTo: task?.assignedTo || "",
    dueDate: task?.dueDate || "",
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, clientsResponse] = await Promise.all([fetch("/api/projects"), fetch("/api/clients")])

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json()
          setProjects(projectsData)
        }

        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setClients(clientsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const taskData = {
        ...formData,
        status: formData.status as Task["status"],
        priority: formData.priority as Task["priority"],
      }

      if (task) {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        })
        if (!response.ok) throw new Error("Failed to update task")
      } else {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        })
        if (!response.ok) throw new Error("Failed to create task")
      }

      if ((window as any).refreshDashboardStats) {
        ;(window as any).refreshDashboardStats()
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedProject = projects.find((project) => project.id === formData.projectId)
  const selectedClient = selectedProject ? clients.find((client) => client.id === selectedProject.clientId) : null

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{task ? "Edit Task" : "Add New Task"}</CardTitle>
            <CardDescription>{task ? "Update task information" : "Create a new task for a project"}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <Select value={formData.projectId} onValueChange={(value) => handleChange("projectId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => {
                    const client = clients.find((c) => c.id === project.clientId)
                    return (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} - {client?.name || "Unknown Client"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {selectedProject && selectedClient && (
                <p className="text-sm text-muted-foreground">
                  Client: {selectedClient.name} | Status: {selectedProject.status}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Design homepage mockup"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the task details and requirements..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
                placeholder="e.g., John Doe, jane@neontek.co.ke"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || !formData.projectId || !formData.title}>
              {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
