"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskForm } from "./task-form"
import { CheckSquare, MoreVertical, Edit, Trash2, Calendar, Clock } from "lucide-react"
import { format, isBefore, isToday } from "date-fns"
import { toast } from "sonner"
import type { ITask } from "@/models/Task"

interface TaskListProps {
  tasks: ITask[]
  projectId: string
  onUpdate: () => void
}

export function TaskList({ tasks, projectId, onUpdate }: TaskListProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "To Do":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getDueDateColor = (dueDate: Date | undefined, status: string) => {
    if (!dueDate || status === "Done") return "text-muted-foreground"

    const now = new Date()
    if (isBefore(dueDate, now)) return "text-red-600 dark:text-red-400"
    if (isToday(dueDate)) return "text-orange-600 dark:text-orange-400"
    return "text-muted-foreground"
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update task")
      }

      toast.success("Task status updated successfully")
      onUpdate()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete task")
      }

      toast.success("Task deleted successfully")
      onUpdate()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "To Do":
        return "In Progress"
      case "In Progress":
        return "Done"
      case "Done":
        return "To Do"
      default:
        return "In Progress"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
        return "✓"
      case "In Progress":
        return "⏳"
      case "To Do":
        return "○"
      default:
        return "○"
    }
  }

  // Group tasks by status
  const tasksByStatus = {
    "To Do": tasks.filter((task) => task.status === "To Do"),
    "In Progress": tasks.filter((task) => task.status === "In Progress"),
    Done: tasks.filter((task) => task.status === "Done"),
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Tasks ({tasks.length})
            </CardTitle>
            <CardDescription>Project tasks and progress</CardDescription>
          </div>
          <TaskForm projectId={projectId} onSuccess={onUpdate} />
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found for this project. Add your first task to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{status}</h4>
                  <Badge variant="outline" className="text-xs">
                    {statusTasks.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {statusTasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-lg"
                          onClick={() => handleStatusChange(task._id, getNextStatus(task.status))}
                          disabled={updatingTaskId === task._id}
                        >
                          {updatingTaskId === task._id ? (
                            <Clock className="h-3 w-3 animate-spin" />
                          ) : (
                            getStatusIcon(task.status)
                          )}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium ${task.status === "Done" ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                          {task.dueDate && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              <p className={`text-xs ${getDueDateColor(new Date(task.dueDate), task.status)}`}>
                                Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                                {isBefore(new Date(task.dueDate), new Date()) && task.status !== "Done" && " (Overdue)"}
                                {isToday(new Date(task.dueDate)) && task.status !== "Done" && " (Due Today)"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTaskStatusColor(task.status)}>{task.status}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <TaskForm
                              task={task}
                              projectId={projectId}
                              onSuccess={onUpdate}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Task
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      No {status.toLowerCase()} tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
