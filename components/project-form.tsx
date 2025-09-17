"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Project, Client } from "@/lib/types"
import { X } from "lucide-react"

interface ProjectFormProps {
  project?: Project
  onSuccess: () => void
  onCancel: () => void
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    clientId: project?.clientId || "",
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "planning",
    startDate: project?.startDate || "",
    endDate: project?.endDate || "",
    budget: project?.budget?.toString() || "",
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (response.ok) {
          const clientsData = await response.json()
          setClients(clientsData)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
      }
    }
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : undefined,
        status: formData.status as Project["status"],
      }

      if (project) {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        })
        if (!response.ok) throw new Error("Failed to update project")
      } else {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        })
        if (!response.ok) throw new Error("Failed to create project")
      }

      if ((window as any).refreshDashboardStats) {
        ;(window as any).refreshDashboardStats()
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedClient = clients.find((client) => client.id === formData.clientId)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{project ? "Edit Project" : "Add New Project"}</CardTitle>
            <CardDescription>
              {project ? "Update project information" : "Create a new project for a client"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-hidden">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
                <div className="max-w-full overflow-x-hidden">
                <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
                  <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.company}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
                </div>
              {selectedClient && (
                <p className="text-sm text-muted-foreground">
                  Contact: {selectedClient.email} | Service: {selectedClient.serviceOffered}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Company Website Redesign"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the project scope and objectives..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (KES)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  placeholder="5000.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || !formData.clientId || !formData.name}>
              {isLoading ? "Saving..." : project ? "Update Project" : "Create Project"}
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
