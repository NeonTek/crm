import { type NextRequest, NextResponse } from "next/server"
import { markNotificationAsRead } from "@/lib/data"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await markNotificationAsRead(params.id)
    if (!success) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
