import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This endpoint can be called by external cron services like Vercel Cron or cron-job.org
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/check-expiry`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const result = await response.json()

    if (result.success) {
      console.log("Cron job completed successfully:", result.message)
      return NextResponse.json({
        success: true,
        message: "Cron job executed successfully",
        result,
      })
    } else {
      console.error("Cron job failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: "Cron job failed",
          details: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error executing cron job:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute cron job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
