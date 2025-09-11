import { NextResponse } from "next/server"
import { getClients, getProjects, getTasks, getNotifications } from "@/lib/data"

export async function GET() {
  try {
    const [clients, projects, tasks, notifications] = await Promise.all([
      getClients(),
      getProjects(),
      getTasks(),
      getNotifications(),
    ])

    const activeProjects = projects.filter((p) => p.status === "in-progress").length
    const completedTasks = tasks.filter((t) => t.status === "completed").length
    const unreadNotifications = notifications.filter((n) => !n.isRead).length

    // Count expiring services (domains/hosting expiring within 30 days)
    const today = new Date()
    const expiringServices = clients.reduce((count, client) => {
      let expiring = 0

      if (client.hostingExpiryDate) {
        const expiryDate = new Date(client.hostingExpiryDate)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) expiring++
      }

      if (client.domainExpiryDate) {
        const expiryDate = new Date(client.domainExpiryDate)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) expiring++
      }

      return count + expiring
    }, 0)

    const stats = {
      totalClients: clients.length,
      totalProjects: projects.length,
      totalTasks: tasks.length,
      unreadNotifications,
      activeProjects,
      completedTasks,
      expiringServices,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
