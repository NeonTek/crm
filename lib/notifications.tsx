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

export function generateBulkEmailContent({
  clientName,
  subject,
  message,
}: {
  clientName: string;
  subject: string;
  message: string;
}): string {
  const formattedMessage = message.replace(/\n/g, "<br />");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 150px;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .content h2 {
            font-size: 24px;
            color: #333333;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background-color: #00BFFF;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 30px 0;
            font-size: 12px;
            color: #888888;
        }
        .social-links a {
            margin: 0 10px;
            display: inline-block;
        }
        .social-links img {
            width: 24px;
            height: 24px;
        }
        .legal-links {
            margin-top: 15px;
        }
        .legal-links a {
            color: #888888;
            text-decoration: none;
            margin: 0 5px;
        }
        .disclaimer {
            margin-top: 15px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="https://neontek.co.ke" target="_blank">
                <img src="https://www.neontek.co.ke/images/logo.png" alt="NeonTek Logo">
            </a>
        </div>
        <div class="content">
            <h2>${subject}</h2>
            <p>Dear ${clientName},</p>
            <p>${formattedMessage}</p>
            <p>If you have any questions, please do not hesitate to reach out to our team.</p>
            <div class="button-container">
                <a href="mailto:admin@neontek.co.ke" class="button">Contact Us</a>
            </div>
            <p>Best regards,<br>
            <strong>The NeonTek Team</strong></p>
        </div>
        <div class="footer">
            <div class="social-links">
                <a href="https://neontek.co.ke/links/instagram" target="_blank"><img src="https://img.icons8.com/ios-glyphs/30/888888/instagram-new.png" alt="Instagram"></a>
                <a href="https://neontek.co.ke/links/facebook" target="_blank"><img src="https://img.icons8.com/ios-glyphs/30/888888/facebook.png" alt="Facebook"></a>
                <a href="https://neontek.co.ke/links/x" target="_blank"><img src="https://img.icons8.com/ios-glyphs/30/888888/twitterx.png" alt="X"></a>
            </div>
            <div class="legal-links">
                <a href="https://neontek.co.ke/legal/terms-of-service" target="_blank">Terms of Service</a> |
                <a href="https://neontek.co.ke/legal/privacy-policy" target="_blank">Privacy Policy</a> |
                <a href="https://neontek.co.ke/legal/cookie-policy" target="_blank">Cookie Policy</a>
            </div>
            <p class="disclaimer">
                This email and any attachments are confidential and intended solely for the use of the individual to whom it is addressed. If you have received this email in error, please notify the sender immediately and delete this email from your system.
            </p>
            <p>&copy; ${new Date().getFullYear()} NeonTek. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

