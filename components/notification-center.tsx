"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Server, Globe, Mail, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"

interface Notification {
  id: string
  type: "hosting-expiry" | "domain-expiry"
  title: string
  message: string
  clientId: string
  isRead: boolean
  daysUntilExpiry?: number
  createdAt: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isSending, setIsSending] = useState<string | null>(null)
  const [emailResults, setEmailResults] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [notificationsResponse, clientsResponse] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/clients"),
      ])

      if (!notificationsResponse.ok || !clientsResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const notificationsData = await notificationsResponse.json()
      const clientsData = await clientsResponse.json()

      setNotifications(notificationsData)
      setClients(clientsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckExpiry = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/notifications/check-expiry", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to check expiry")
      }

      const result = await response.json()
      await loadData()

      if (result.newNotifications === 0) {
        setEmailResults({ general: "No expiring services found." })
      }
    } catch (error) {
      console.error("Error checking expiry:", error)
      setEmailResults({ general: "Error checking expiring services. Please try again." })
    } finally {
      setIsChecking(false)
    }
  }

  const handleSendEmail = async (notification: Notification) => {
    const client = clients.find((c) => c.id === notification.clientId)
    if (!client) return

    setIsSending(notification.id)
    try {
      const response = await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client.id,
          notificationType: notification.type,
          daysUntilExpiry: notification.daysUntilExpiry || 0,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      const result = await response.json()

      setEmailResults((prev) => ({
        ...prev,
        [notification.id]: result.message,
      }))

      // Mark notification as read after sending email
      await handleMarkAsRead(notification.id)
    } catch (error) {
      setEmailResults((prev) => ({
        ...prev,
        [notification.id]: "Failed to send email. Please try again.",
      }))
    } finally {
      setIsSending(null)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to mark as read")
      }

      await loadData()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "hosting-expiry":
        return <Server className="h-4 w-4" />
      case "domain-expiry":
        return <Globe className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (daysUntilExpiry: number | undefined) => {
    if (!daysUntilExpiry) return "bg-gray-100 text-gray-800"
    if (daysUntilExpiry <= 1) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (daysUntilExpiry <= 7) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Notification Center</h2>
            <p className="text-muted-foreground">Monitor domain and hosting expiry dates and send notifications</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
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
          <h2 className="text-2xl font-bold">Notification Center</h2>
          <p className="text-muted-foreground">Monitor domain and hosting expiry dates and send notifications</p>
        </div>
        <Button onClick={handleCheckExpiry} disabled={isChecking}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Checking..." : "Check Expiry"}
        </Button>
      </div>

      {emailResults.general && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{emailResults.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{unreadNotifications.length}</p>
                <p className="text-sm text-muted-foreground">Unread Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(emailResults).length}</p>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground mb-4">
                No expiring services found. Click "Check Expiry" to scan for upcoming domain and hosting renewals.
              </p>
              <Button onClick={handleCheckExpiry} disabled={isChecking}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
                Check for Expiring Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const client = clients.find((c) => c.id === notification.clientId)
            const emailResult = emailResults[notification.id]

            return (
              <Card key={notification.id} className={`${notification.isRead ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">{getNotificationIcon(notification.type)}</div>
                      <div>
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                        <CardDescription>{notification.message}</CardDescription>
                        {client && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Contact: {client.email} | {client.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.daysUntilExpiry !== undefined && (
                        <Badge className={getUrgencyColor(notification.daysUntilExpiry)} variant="secondary">
                          {notification.daysUntilExpiry} day{notification.daysUntilExpiry !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {!notification.isRead && <Badge variant="default">New</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {emailResult && (
                    <Alert className="mb-4">
                      <Mail className="h-4 w-4" />
                      <AlertDescription>{emailResult}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSendEmail(notification)}
                      disabled={isSending === notification.id || notification.isRead}
                      size="sm"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {isSending === notification.id ? "Sending..." : "Send Email"}
                    </Button>

                    {!notification.isRead && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
