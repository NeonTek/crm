import connectDB from "./mongoose"
import { ClientModel, ProjectModel, TaskModel, NotificationModel } from "./models"
import type { Client, Project, Task, Notification } from "./types"

// Database operations for Clients
export async function getClientsFromDB(): Promise<Client[]> {
  try {
    await connectDB()
    const clients = await ClientModel.find({}).sort({ createdAt: -1 }).lean()
    return clients.map((client) => ({
      ...client,
      id: client._id.toString(),
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    })) as Client[]
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function getClientByIdFromDB(id: string): Promise<Client | null> {
  try {
    await connectDB()
    const client = await ClientModel.findById(id).lean()
    if (!client) return null
    return {
      ...client,
      id: client._id.toString(),
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    } as Client
  } catch (error) {
    console.error("Error fetching client:", error)
    return null
  }
}

export async function createClientInDB(clientData: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
  try {
    await connectDB()
    const client = new ClientModel(clientData)
    const savedClient = await client.save()
    return savedClient.toJSON() as Client
  } catch (error) {
    console.error("Error creating client:", error)
    throw error
  }
}

export async function updateClientInDB(id: string, updates: Partial<Client>): Promise<Client | null> {
  try {
    await connectDB()
    const client = await ClientModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean()
    if (!client) return null
    return {
      ...client,
      id: client._id.toString(),
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    } as Client
  } catch (error) {
    console.error("Error updating client:", error)
    return null
  }
}

export async function deleteClientFromDB(id: string): Promise<boolean> {
  try {
    await connectDB()
    const result = await ClientModel.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error("Error deleting client:", error)
    return false
  }
}

// Database operations for Projects
export async function getProjectsFromDB(): Promise<Project[]> {
  try {
    await connectDB()
    const projects = await ProjectModel.find({}).sort({ createdAt: -1 }).lean()
    return projects.map((project) => ({
      ...project,
      id: project._id.toString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    })) as Project[]
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function getProjectsByClientIdFromDB(clientId: string): Promise<Project[]> {
  try {
    await connectDB()
    const projects = await ProjectModel.find({ clientId }).sort({ createdAt: -1 }).lean()
    return projects.map((project) => ({
      ...project,
      id: project._id.toString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    })) as Project[]
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function createProjectInDB(
  projectData: Omit<Project, "id" | "createdAt" | "updatedAt">,
): Promise<Project> {
  try {
    await connectDB()
    const project = new ProjectModel(projectData)
    const savedProject = await project.save()
    return savedProject.toJSON() as Project
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

export async function updateProjectInDB(id: string, updates: Partial<Project>): Promise<Project | null> {
  try {
    await connectDB()
    const project = await ProjectModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean()
    if (!project) return null
    return {
      ...project,
      id: project._id.toString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    } as Project
  } catch (error) {
    console.error("Error updating project:", error)
    return null
  }
}

export async function deleteProjectFromDB(id: string): Promise<boolean> {
  try {
    await connectDB()
    const result = await ProjectModel.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error("Error deleting project:", error)
    return false
  }
}

// Database operations for Tasks
export async function getTasksFromDB(): Promise<Task[]> {
  try {
    await connectDB()
    const tasks = await TaskModel.find({}).sort({ createdAt: -1 }).lean()
    return tasks.map((task) => ({
      ...task,
      id: task._id.toString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })) as Task[]
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
}

export async function getTasksByProjectIdFromDB(projectId: string): Promise<Task[]> {
  try {
    await connectDB()
    const tasks = await TaskModel.find({ projectId }).sort({ createdAt: -1 }).lean()
    return tasks.map((task) => ({
      ...task,
      id: task._id.toString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })) as Task[]
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
}

export async function createTaskInDB(taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  try {
    await connectDB()
    const task = new TaskModel(taskData)
    const savedTask = await task.save()
    return savedTask.toJSON() as Task
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

export async function updateTaskInDB(id: string, updates: Partial<Task>): Promise<Task | null> {
  try {
    await connectDB()
    const task = await TaskModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean()
    if (!task) return null
    return {
      ...task,
      id: task._id.toString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    } as Task
  } catch (error) {
    console.error("Error updating task:", error)
    return null
  }
}

export async function deleteTaskFromDB(id: string): Promise<boolean> {
  try {
    await connectDB()
    const result = await TaskModel.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error("Error deleting task:", error)
    return false
  }
}

// Database operations for Notifications
export async function getNotificationsFromDB(): Promise<Notification[]> {
  try {
    await connectDB()
    const notifications = await NotificationModel.find({}).sort({ createdAt: -1 }).lean()
    return notifications.map((notification) => ({
      ...notification,
      id: notification._id.toString(),
      createdAt: notification.createdAt.toISOString(),
    })) as Notification[]
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

export async function createNotificationInDB(
  notificationData: Omit<Notification, "id" | "createdAt">,
): Promise<Notification> {
  try {
    await connectDB()
    const notification = new NotificationModel(notificationData)
    const savedNotification = await notification.save()
    return savedNotification.toJSON() as Notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function markNotificationAsReadInDB(id: string): Promise<boolean> {
  try {
    await connectDB()
    const result = await NotificationModel.findByIdAndUpdate(id, { isRead: true })
    return !!result
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}
