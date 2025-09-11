import { NextResponse } from "next/server"
import { checkExpiringServices } from "@/lib/notifications"

export async function POST() {
  try {
    const newNotifications = checkExpiringServices()

    return NextResponse.json({
      success: true,
      newNotifications: newNotifications.length,
      message: `Found ${newNotifications.length} expiring services`,
    })
  } catch (error) {
    console.error("Error checking expiring services:", error)
    return NextResponse.json({ error: "Failed to check expiring services" }, { status: 500 })
  }
}
