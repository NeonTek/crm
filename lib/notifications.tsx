import { getClients, createNotification, type Client, type Notification } from "./data"

export async function checkExpiringServices(): Promise<Notification[]> {
  const clients = await getClients()
  const notifications: Notification[] = []
  const today = new Date()

  for (const client of clients) {
    // Check hosting expiry
    if (client.hostingExpiryDate) {
      const expiryDate = new Date(client.hostingExpiryDate)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        const notification = await createNotification({
          type: "hosting-expiry",
          clientId: client.id,
          title: `Hosting Expiring Soon - ${client.name}`,
          message: `${client.name}'s hosting with ${client.hostingProvider} expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()})`,
          daysUntilExpiry,
          isRead: false,
        })
        notifications.push(notification)
      }
    }

    // Check domain expiry
    if (client.domainExpiryDate) {
      const expiryDate = new Date(client.domainExpiryDate)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        const notification = await createNotification({
          type: "domain-expiry",
          clientId: client.id,
          title: `Domain Expiring Soon - ${client.name}`,
          message: `${client.name}'s domain ${client.domainName} expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()})`,
          daysUntilExpiry,
          isRead: false,
        })
        notifications.push(notification)
      }
    }
  }

  return notifications
}

export function generateEmailContent(client: Client, type: "hosting" | "domain", daysUntilExpiry: number): string {
  const isHosting = type === "hosting"
  const serviceName = isHosting ? "hosting" : "domain"
  const serviceDetails = isHosting ? client.hostingProvider : client.domainName
  const expiryDate = isHosting ? client.hostingExpiryDate : client.domainExpiryDate
  const price = isHosting ? client.hostingPrice : client.domainPrice

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Expiry Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00BFFF, #0099CC); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #00BFFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .urgent { color: #d63031; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NeonTek | CRM</h1>
            <h2>${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Expiry Notification</h2>
        </div>
        
        <div class="content">
            <p>Dear ${client.contactPerson || client.name},</p>
            
            <div class="alert">
                <h3 class="${daysUntilExpiry <= 7 ? "urgent" : ""}">
                    ⚠️ Your ${serviceName} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}
                </h3>
            </div>
            
            <p>This is a friendly reminder that your ${serviceName} service is approaching its expiry date.</p>
            
            <div class="details">
                <h3>Service Details:</h3>
                <ul>
                    <li><strong>Client:</strong> ${client.name}</li>
                    <li><strong>Company:</strong> ${client.company}</li>
                    <li><strong>${isHosting ? "Hosting Provider" : "Domain Name"}:</strong> ${serviceDetails}</li>
                    <li><strong>Expiry Date:</strong> ${expiryDate ? new Date(expiryDate).toLocaleDateString() : "Not specified"}</li>
                    ${price ? `<li><strong>Renewal Price:</strong> KES${price}</li>` : ""}
                </ul>
            </div>
            
            <p>To ensure uninterrupted service, please contact us to renew your ${serviceName} before the expiry date.</p>
            
            <div style="text-align: center;">
                <a href="mailto:admin@neontek.co.ke" class="button">Contact NeonTek</a>
            </div>
            
            <p>If you have any questions or need assistance with the renewal process, please don't hesitate to reach out to our team.</p>
            
            <p>Best regards,<br>
            <strong>NeonTek Team</strong><br>
            Email: admin@neontek.co.ke<br>
            Website: https://neontek.co.ke</p>
        </div>
        
        <div class="footer">
            <p>This is an automated notification from NeonTek CRM system.</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export async function sendExpiryEmail(
  client: Client,
  type: "hosting" | "domain",
  daysUntilExpiry: number
) {
  const emailContent = generateEmailContent(client, type, daysUntilExpiry)
  const serviceName = type === "hosting" ? "Hosting" : "Domain"

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: client.email,
        subject: `⏰ ${serviceName} Expiry Reminder - ${client.name}`,
        htmlContent: emailContent,
      }),
    })

    const data = await res.json()

    if (!data.success) {
      throw new Error(data.message || "Unknown error while sending mail")
    }

    return {
      success: true,
      message: `${serviceName} expiry email sent to ${client.email}`,
    }
  } catch (error: any) {
    console.error(`Failed to send ${serviceName} expiry email:`, error)
    return {
      success: false,
      message: `Failed to send ${serviceName} expiry email to ${client.email}`,
      error: error.message,
    }
  }
}
