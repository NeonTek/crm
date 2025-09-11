import { type NextRequest, NextResponse } from "next/server"
import { getNotifications, createNotification } from "@/lib/data"

export async function GET() {
  try {
    const notifications = await getNotifications()
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json()
    const newNotification = await createNotification(notificationData)
    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
