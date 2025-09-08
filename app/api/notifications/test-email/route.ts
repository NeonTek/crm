import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, generateExpiryReminderEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, clientName, projectName, serviceType, daysUntilExpiry } = body

    if (!email || !clientName || !projectName || !serviceType || daysUntilExpiry === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: email, clientName, projectName, serviceType, daysUntilExpiry",
        },
        { status: 400 },
      )
    }

    // Create a test expiry date
    const testExpiryDate = new Date()
    testExpiryDate.setDate(testExpiryDate.getDate() + daysUntilExpiry)

    const emailHtml = generateExpiryReminderEmail(clientName, projectName, serviceType, testExpiryDate, daysUntilExpiry)

    const emailResult = await sendEmail({
      to: email,
      subject: `[TEST] ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Expiry Reminder - ${projectName}`,
      html: emailHtml,
    })

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        messageId: emailResult.messageId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test email",
          details: emailResult.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
