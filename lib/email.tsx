import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<EmailResult> {
  try {
    // Only create transporter when actually sending email (not during build)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      return {
        success: false,
        error: "Email credentials not configured",
      }
    }

    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: `"Neontek CRM" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function generateExpiryReminderEmail(
  clientName: string,
  projectName: string,
  serviceType: "domain" | "hosting",
  expiryDate: Date,
  daysUntilExpiry: number,
): string {
  const urgencyColor = daysUntilExpiry <= 1 ? "#ef4444" : daysUntilExpiry <= 7 ? "#f59e0b" : "#00bcd4"
  const urgencyText = daysUntilExpiry <= 1 ? "URGENT" : daysUntilExpiry <= 7 ? "Important" : "Reminder"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Expiry Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center;">
          <h1 style="color: #00bcd4; margin: 0; font-size: 28px; font-weight: 700;">NEONTEK</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 14px;">Client Relationship Management</p>
        </div>

        <!-- Urgency Banner -->
        <div style="background-color: ${urgencyColor}; color: white; text-align: center; padding: 12px; font-weight: 600; font-size: 16px;">
          ${urgencyText}: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Expiring Soon
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello ${clientName},</h2>
          
          <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            This is a friendly reminder that your ${serviceType} service for <strong>${projectName}</strong> is expiring soon.
          </p>

          <!-- Expiry Details Box -->
          <div style="background-color: #f1f5f9; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 600; color: #1e293b;">Project:</span>
              <span style="color: #475569;">${projectName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 600; color: #1e293b;">Service:</span>
              <span style="color: #475569;">${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 600; color: #1e293b;">Expiry Date:</span>
              <span style="color: #475569;">${expiryDate.toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #1e293b;">Days Remaining:</span>
              <span style="color: ${urgencyColor}; font-weight: 700; font-size: 18px;">${daysUntilExpiry}</span>
            </div>
          </div>

          <p style="color: #475569; line-height: 1.6; margin: 20px 0; font-size: 16px;">
            To ensure uninterrupted service, please contact us as soon as possible to discuss renewal options.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${process.env.EMAIL_USER}" style="background-color: #00bcd4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Contact Us for Renewal
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            This is an automated reminder from Neontek CRM.<br>
            If you have any questions, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateTestEmail(recipientEmail: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Neontek CRM Test Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center;">
          <h1 style="color: #00bcd4; margin: 0; font-size: 28px; font-weight: 700;">NEONTEK</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 14px;">Client Relationship Management</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Email System Test</h2>
          
          <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Congratulations! Your Neontek CRM email notification system is working correctly.
          </p>

          <div style="background-color: #f0fdfa; border-left: 4px solid #00bcd4; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #0f766e; margin: 0; font-weight: 600;">✓ Email configuration is successful</p>
            <p style="color: #0f766e; margin: 8px 0 0 0;">✓ SMTP connection established</p>
            <p style="color: #0f766e; margin: 8px 0 0 0;">✓ Email delivery confirmed</p>
          </div>

          <p style="color: #475569; line-height: 1.6; margin: 20px 0; font-size: 16px;">
            This test email was sent to: <strong>${recipientEmail}</strong><br>
            Timestamp: ${new Date().toLocaleString()}
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            This is a test email from Neontek CRM.<br>
            Your email notification system is ready for production use.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
