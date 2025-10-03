import { type NextRequest, NextResponse } from "next/server";
import { getClientById } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();
    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const subject = `Welcome to the NeonTek Client Portal!`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <div style="background: #00BFFF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>Welcome to NeonTek!</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #00BFFF;">Your Client Portal is Ready</h2>
            <p>Hello ${client.name},</p>
            <p>We're thrilled to have you on board! We have set up your personal client portal to help you track project progress, manage billing, and communicate with our team.</p>
            <p>To get started, you will need your unique Client ID to log in.</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px; color: #555;">Your Client ID is:</p>
              <p style="margin: 10px 0; font-size: 24px; font-weight: bold; color: #00BFFF; letter-spacing: 2px;">${client.id}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/portal/login" style="background-color: #00BFFF; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Login to Your Portal</a>
            </div>
            <p>We recommend bookmarking the portal for easy access. If you have any questions, simply reply to this email or use the support ticket system inside the portal.</p>
            <p>Best regards,<br>The NeonTek Team</p>
          </div>
        </div>
      `;

    await fetch(`${baseUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: client.email, subject, htmlContent }),
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding email sent.",
    });
  } catch (error) {
    console.error("Onboarding email error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to send onboarding email", details: errorMessage },
      { status: 500 }
    );
  }
}
