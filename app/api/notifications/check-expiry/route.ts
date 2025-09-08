import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Project from "@/models/Project"
import { sendEmail, generateExpiryReminderEmail } from "@/lib/email"

export async function POST() {
  try {
    await dbConnect()

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)

    // Find projects with expiring domains or hosting
    const expiringProjects = await Project.find({
      $or: [
        {
          domainExpiry: {
            $gte: now,
            $lte: thirtyDaysFromNow,
          },
        },
        {
          hostingExpiry: {
            $gte: now,
            $lte: thirtyDaysFromNow,
          },
        },
      ],
    }).populate("client", "name email")

    const notifications = []
    const emailsSent = []

    for (const project of expiringProjects) {
      const client = project.client as any

      // Check domain expiry
      if (project.domainExpiry) {
        const domainExpiry = new Date(project.domainExpiry)
        const daysUntilExpiry = Math.ceil((domainExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Send notifications at 30, 7, and 1 day intervals
        if (daysUntilExpiry === 30 || daysUntilExpiry === 7 || daysUntilExpiry === 1) {
          const emailHtml = generateExpiryReminderEmail(
            client.name,
            project.name,
            "domain",
            domainExpiry,
            daysUntilExpiry,
          )

          const emailResult = await sendEmail({
            to: client.email,
            subject: `Domain Expiry Reminder - ${project.name} (${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""} remaining)`,
            html: emailHtml,
          })

          notifications.push({
            type: "domain",
            project: project.name,
            client: client.name,
            email: client.email,
            expiryDate: domainExpiry,
            daysUntilExpiry,
            emailSent: emailResult.success,
            messageId: emailResult.messageId,
          })

          if (emailResult.success) {
            emailsSent.push({
              type: "domain",
              project: project.name,
              client: client.name,
              daysUntilExpiry,
            })
          }
        }
      }

      // Check hosting expiry
      if (project.hostingExpiry) {
        const hostingExpiry = new Date(project.hostingExpiry)
        const daysUntilExpiry = Math.ceil((hostingExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Send notifications at 30, 7, and 1 day intervals
        if (daysUntilExpiry === 30 || daysUntilExpiry === 7 || daysUntilExpiry === 1) {
          const emailHtml = generateExpiryReminderEmail(
            client.name,
            project.name,
            "hosting",
            hostingExpiry,
            daysUntilExpiry,
          )

          const emailResult = await sendEmail({
            to: client.email,
            subject: `Hosting Expiry Reminder - ${project.name} (${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""} remaining)`,
            html: emailHtml,
          })

          notifications.push({
            type: "hosting",
            project: project.name,
            client: client.name,
            email: client.email,
            expiryDate: hostingExpiry,
            daysUntilExpiry,
            emailSent: emailResult.success,
            messageId: emailResult.messageId,
          })

          if (emailResult.success) {
            emailsSent.push({
              type: "hosting",
              project: project.name,
              client: client.name,
              daysUntilExpiry,
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Expiry check completed. ${emailsSent.length} notification emails sent.`,
      notifications,
      emailsSent,
      totalProjectsChecked: expiringProjects.length,
    })
  } catch (error) {
    console.error("Error checking expiry notifications:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check expiry notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check what notifications would be sent (dry run)
export async function GET() {
  try {
    await dbConnect()

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const expiringProjects = await Project.find({
      $or: [
        {
          domainExpiry: {
            $gte: now,
            $lte: thirtyDaysFromNow,
          },
        },
        {
          hostingExpiry: {
            $gte: now,
            $lte: thirtyDaysFromNow,
          },
        },
      ],
    }).populate("client", "name email")

    const upcomingNotifications = []

    for (const project of expiringProjects) {
      const client = project.client as any

      if (project.domainExpiry) {
        const domainExpiry = new Date(project.domainExpiry)
        const daysUntilExpiry = Math.ceil((domainExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        upcomingNotifications.push({
          type: "domain",
          project: project.name,
          client: client.name,
          email: client.email,
          expiryDate: domainExpiry,
          daysUntilExpiry,
          willSendNotification: daysUntilExpiry === 30 || daysUntilExpiry === 7 || daysUntilExpiry === 1,
        })
      }

      if (project.hostingExpiry) {
        const hostingExpiry = new Date(project.hostingExpiry)
        const daysUntilExpiry = Math.ceil((hostingExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        upcomingNotifications.push({
          type: "hosting",
          project: project.name,
          client: client.name,
          email: client.email,
          expiryDate: hostingExpiry,
          daysUntilExpiry,
          willSendNotification: daysUntilExpiry === 30 || daysUntilExpiry === 7 || daysUntilExpiry === 1,
        })
      }
    }

    return NextResponse.json({
      success: true,
      upcomingNotifications: upcomingNotifications.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
      totalProjectsChecked: expiringProjects.length,
      notificationsToSend: upcomingNotifications.filter((n) => n.willSendNotification).length,
    })
  } catch (error) {
    console.error("Error getting upcoming notifications:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get upcoming notifications",
      },
      { status: 500 },
    )
  }
}
