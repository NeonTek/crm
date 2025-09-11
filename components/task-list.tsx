"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskForm } from "./task-form"
import { Search, Plus, Edit, Trash2, Calendar, User, AlertCircle, CheckCircle2, Clock, ListTodo } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  projectId: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  assignedTo?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  clientId: string
}

interface Client {
  id: string
  name: string
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    // Sort by priority (high -> medium -> low) and then by due date
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      return 0
    })

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter, priorityFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [tasksResponse, projectsResponse, clientsResponse] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/projects"),
        fetch("/api/clients"),
      ])

      if (!tasksResponse.ok || !projectsResponse.ok || !clientsResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const tasksData = await tasksResponse.json()
      const projectsData = await projectsResponse.json()
      const clientsData = await clientsResponse.json()

      setTasks(tasksData)
      setProjects(projectsData)
      setClients(clientsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProjectInfo = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return { projectName: "Unknown Project", clientName: "Unknown Client" }

    const client = clients.find((c) => c.id === project.clientId)
    return {
      projectName: project.name,
      clientName: client?.name || "Unknown Client",
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return <ListTodo className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <ListTodo className="h-4 w-4" />
    }
  }

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const handleStatusChange = async (taskId: string, completed: boolean) => {
    const newStatus = completed ? "completed" : "todo"
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      await loadData()
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Failed to update task. Please try again.")
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDelete = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete task")
        }

        await loadData()
      } catch (error) {
        console.error("Error deleting task:", error)
        alert("Failed to delete task. Please try again.")
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTask(undefined)
    loadData()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTask(undefined)
  }

  if (showForm) {
    return <TaskForm task={editingTask} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tasks</h2>
            <p className="text-muted-foreground">Manage project tasks and track their progress</p>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-muted-foreground">Manage project tasks and track their progress</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const { projectName, clientName } = getProjectInfo(task.projectId)
          const overdue = isOverdue(task.dueDate)

          return (
            <Card key={task.id} className={`hover:shadow-md transition-shadow ${overdue ? "border-red-200" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => handleStatusChange(task.id, checked as boolean)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {projectName} • {clientName}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusColor(task.status)} variant="secondary">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          {task.status.replace("-", " ").toUpperCase()}
                        </span>
                      </Badge>

                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {task.priority.toUpperCase()}
                      </Badge>

                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600" : "text-muted-foreground"}`}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          {overdue && <span className="text-red-600 font-medium">(Overdue)</span>}
                        </div>
                      )}

                      {task.assignedTo && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{task.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTasks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
              ? "No tasks match your search criteria."
              : "Get started by creating your first task."}
          </p>
          {!searchTerm && statusFilter === "all" && priorityFilter === "all" && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
