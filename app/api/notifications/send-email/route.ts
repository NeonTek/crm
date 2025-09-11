import { type NextRequest, NextResponse } from "next/server"
import { sendExpiryEmail } from "@/lib/notifications"
import { getClientById } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const { clientId, notificationType, daysUntilExpiry } = await request.json()

    const client = await getClientById(clientId)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const type = notificationType === "hosting-expiry" ? "hosting" : "domain"
    const result = await sendExpiryEmail(client, type, daysUntilExpiry)

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
