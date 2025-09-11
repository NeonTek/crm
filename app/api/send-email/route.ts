import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, htmlContent } = await request.json()

    if (!to || !subject || !htmlContent) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: "mail.neontek.co.ke",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || "no-reply@neontek.co.ke",
        pass: process.env.EMAIL_PASS || "_?V8DU7A?qk{Y;Sf",
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"NeonTek CRM" <no-reply@neontek.co.ke>`,
      to,
      subject,
      html: htmlContent,
    })

    console.log("Email sent:", info.messageId)

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${to}`,
      id: info.messageId,
    })
  } catch (error: any) {
    console.error("Email sending error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send email", error: error.message },
      { status: 500 }
    )
  }
}
