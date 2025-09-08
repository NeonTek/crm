export interface DashboardMetrics {
  totalClients: number
  activeProjects: number
  tasksDueThisWeek: number
  expiringServices: number
}

export interface RecentActivity {
  type: "client" | "project"
  message: string
  date: Date
}

export interface UpcomingTask {
  _id: string
  title: string
  dueDate: Date
  status: string
  project: {
    _id: string
    name: string
    client: {
      _id: string
      name: string
    }
  }
}

export interface ExpiringService {
  _id: string
  name: string
  domainExpiry?: Date
  hostingExpiry?: Date
  client: {
    _id: string
    name: string
  }
}

export interface DashboardData {
  metrics: DashboardMetrics
  recentActivity: RecentActivity[]
  upcomingDeadlines: {
    tasks: UpcomingTask[]
    domains: ExpiringService[]
    hosting: ExpiringService[]
  }
}
