// Mock data store for NeonTek CRM
// In production, this would be replaced with actual database operations
import type { Client, Project, Task, Notification } from "./types"
import {
  getClientsFromDB,
  getClientByIdFromDB,
  createClientInDB,
  updateClientInDB,
  deleteClientFromDB,
  getProjectsFromDB,
  getProjectsByClientIdFromDB,
  createProjectInDB,
  updateProjectInDB,
  deleteProjectFromDB,
  getTasksFromDB,
  getTasksByProjectIdFromDB,
  createTaskInDB,
  updateTaskInDB,
  deleteTaskFromDB,
  getNotificationsFromDB,
  createNotificationInDB,
  markNotificationAsReadInDB,
} from "./mongodb"

// Client CRUD operations
export async function getClients(): Promise<Client[]> {
  return await getClientsFromDB()
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const client = await getClientByIdFromDB(id)
  return client || undefined
}

export async function createClient(clientData: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
  return await createClientInDB(clientData)
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  return await updateClientInDB(id, updates)
}

export async function deleteClient(id: string): Promise<boolean> {
  return await deleteClientFromDB(id)
}

// Project CRUD operations
export async function getProjects(): Promise<Project[]> {
  return await getProjectsFromDB()
}

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
  return await getProjectsByClientIdFromDB(clientId)
}

export async function createProject(projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  return await createProjectInDB(projectData)
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  return await updateProjectInDB(id, updates)
}

export async function deleteProject(id: string): Promise<boolean> {
  return await deleteProjectFromDB(id)
}

// Task CRUD operations
export async function getTasks(): Promise<Task[]> {
  return await getTasksFromDB()
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  return await getTasksByProjectIdFromDB(projectId)
}

export async function createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  return await createTaskInDB(taskData)
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  return await updateTaskInDB(id, updates)
}

export async function deleteTask(id: string): Promise<boolean> {
  return await deleteTaskFromDB(id)
}

// Notification operations
export async function getNotifications(): Promise<Notification[]> {
  return await getNotificationsFromDB()
}

export async function createNotification(
  notificationData: Omit<Notification, "id" | "createdAt">,
): Promise<Notification> {
  return await createNotificationInDB(notificationData)
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  return await markNotificationAsReadInDB(id)
}
