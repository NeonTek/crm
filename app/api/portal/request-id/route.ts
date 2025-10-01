import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ClientModel as Client } from "@/lib/models";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const client = await Client.findOne({ email }).lean();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (client) {
      const subject = "Your NeonTek Client Portal ID";
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <div style="background: #00BFFF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>NeonTek Client Portal</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #00BFFF;">Here is Your Client ID</h2>
            <p>Hello ${client.name},</p>
            <p>You requested your Client ID for the NeonTek Client Portal. Please use the ID below to log in and access your dashboard.</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px; color: #555;">Your Client ID is:</p>
              <p style="margin: 10px 0; font-size: 24px; font-weight: bold; color: #00BFFF; letter-spacing: 2px;">${client._id.toString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/portal/login" style="background-color: #00BFFF; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Login to Portal</a>
            </div>
            <p>If you did not request this, you can safely ignore this email.</p>
            <p>Best regards,<br>The NeonTek Team</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #aaa; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            &copy; ${new Date().getFullYear()} NeonTek. All Rights Reserved.
          </div>
        </div>
      `;

      await fetch(`${baseUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: client.email, subject, htmlContent }),
      });
    }

    // Always return a success message to prevent email enumeration attacks
    return NextResponse.json({
      message:
        "If your email is in our system, you will receive your ID shortly.",
    });
  } catch (error) {
    console.error("Request ID error:", error);
    // Return the same generic message for security
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
