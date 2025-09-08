"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Send, RefreshCw, AlertTriangle, CheckCircle, Globe, Server, Calendar } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface UpcomingNotification {
  type: "domain" | "hosting"
  project: string
  client: string
  email: string
  expiryDate: string
  daysUntilExpiry: number
  willSendNotification: boolean
}

interface NotificationResult {
  type: string
  project: string
  client: string
  email: string
  expiryDate: string
  daysUntilExpiry: number
  emailSent: boolean
  messageId?: string
}

export function NotificationManager() {
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [upcomingNotifications, setUpcomingNotifications] = useState<UpcomingNotification[]>([])
  const [lastCheckResult, setLastCheckResult] = useState<{
    notifications: NotificationResult[]
    emailsSent: any[]
    totalProjectsChecked: number
  } | null>(null)

  // Test email form state
  const [testEmail, setTestEmail] = useState("")
  const [testClientName, setTestClientName] = useState("Test Client")
  const [testProjectName, setTestProjectName] = useState("Test Project")
  const [testServiceType, setTestServiceType] = useState("domain")
  const [testDaysUntilExpiry, setTestDaysUntilExpiry] = useState("7")

  const fetchUpcomingNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications/check-expiry")
      if (!response.ok) throw new Error("Failed to fetch notifications")

      const data = await response.json()
      setUpcomingNotifications(data.upcomingNotifications || [])
      toast.success("Upcoming notifications loaded successfully")
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Failed to load upcoming notifications")
    } finally {
      setLoading(false)
    }
  }

  const runExpiryCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications/check-expiry", { method: "POST" })
      if (!response.ok) throw new Error("Failed to run expiry check")

      const data = await response.json()
      setLastCheckResult(data)
      toast.success(data.message)

      // Refresh upcoming notifications
      await fetchUpcomingNotifications()
    } catch (error) {
      console.error("Error running expiry check:", error)
      toast.error("Failed to run expiry check")
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address")
      return
    }

    setTestLoading(true)
    try {
      const response = await fetch("/api/notifications/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          clientName: testClientName,
          projectName: testProjectName,
          serviceType: testServiceType,
          daysUntilExpiry: Number.parseInt(testDaysUntilExpiry),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Test email sent successfully")
      } else {
        throw new Error(data.error || "Failed to send test email")
      }
    } catch (error: any) {
      console.error("Error sending test email:", error)
      toast.error(error.message)
    } finally {
      setTestLoading(false)
    }
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return "text-red-600 dark:text-red-400"
    if (days <= 7) return "text-orange-600 dark:text-orange-400"
    return "text-blue-600 dark:text-blue-400"
  }

  const getUrgencyBadge = (days: number) => {
    if (days <= 1) return { variant: "destructive" as const, text: "Critical" }
    if (days <= 7) return { variant: "secondary" as const, text: "Urgent" }
    return { variant: "outline" as const, text: "Upcoming" }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Email Notifications</h2>
        <p className="text-muted-foreground">Manage automated email reminders for expiring services</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Upcoming Notifications
            </CardTitle>
            <CardDescription>Services that will trigger email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchUpcomingNotifications} disabled={loading} className="w-full gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Check Upcoming Notifications
            </Button>

            {upcomingNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming notifications found. Click "Check Upcoming Notifications" to scan for expiring services.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingNotifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {notification.type === "domain" ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
                          <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                          <Server className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{notification.project}</p>
                      <p className="text-sm text-muted-foreground">{notification.client}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} expires:{" "}
                        {format(new Date(notification.expiryDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge
                        className={`${getUrgencyColor(notification.daysUntilExpiry)}`}
                        variant={getUrgencyBadge(notification.daysUntilExpiry).variant}
                      >
                        {notification.daysUntilExpiry} days
                      </Badge>
                      {notification.willSendNotification && (
                        <Badge variant="outline" className="text-xs">
                          Will notify
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Check & Test Email */}
        <div className="space-y-6">
          {/* Manual Expiry Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Manual Expiry Check
              </CardTitle>
              <CardDescription>Run the expiry check and send notifications now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runExpiryCheck} disabled={loading} className="w-full gap-2">
                <Send className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Run Expiry Check & Send Emails
              </Button>

              {lastCheckResult && (
                <div className="space-y-2">
                  <Separator />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Last Check Results:</p>
                    <p className="text-muted-foreground">Checked {lastCheckResult.totalProjectsChecked} projects</p>
                    <p className="text-muted-foreground">
                      Sent {lastCheckResult.emailsSent.length} notification emails
                    </p>
                    {lastCheckResult.emailsSent.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {lastCheckResult.emailsSent.map((email, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>
                              {email.type} reminder sent to {email.client} ({email.daysUntilExpiry} days)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle>Test Email</CardTitle>
              <CardDescription>Send a test expiry reminder email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testClientName">Client Name</Label>
                  <Input
                    id="testClientName"
                    placeholder="Client name"
                    value={testClientName}
                    onChange={(e) => setTestClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testProjectName">Project Name</Label>
                  <Input
                    id="testProjectName"
                    placeholder="Project name"
                    value={testProjectName}
                    onChange={(e) => setTestProjectName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testServiceType">Service Type</Label>
                  <Select value={testServiceType} onValueChange={setTestServiceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domain">Domain</SelectItem>
                      <SelectItem value="hosting">Hosting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testDaysUntilExpiry">Days Until Expiry</Label>
                  <Select value={testDaysUntilExpiry} onValueChange={setTestDaysUntilExpiry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={sendTestEmail} disabled={testLoading} className="w-full gap-2">
                <Send className={`h-4 w-4 ${testLoading ? "animate-spin" : ""}`} />
                Send Test Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Automated Scheduling
          </CardTitle>
          <CardDescription>How to set up automated daily email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">To enable automated daily notifications, you can:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                <strong>Vercel Cron Jobs:</strong> Add a cron job in your Vercel project settings that calls{" "}
                <code className="bg-muted px-1 rounded">/api/cron</code> daily
              </li>
              <li>
                <strong>External Cron Service:</strong> Use a service like cron-job.org to call{" "}
                <code className="bg-muted px-1 rounded">/api/cron</code> daily
              </li>
              <li>
                <strong>Manual Check:</strong> Use the "Run Expiry Check" button above to manually trigger notifications
              </li>
            </ol>
            <p className="text-muted-foreground">
              The system automatically sends notifications at 30 days, 7 days, and 1 day before expiry.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
