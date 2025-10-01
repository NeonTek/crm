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

    if (client) {
      // Send email with the client ID using the existing send-email API route
      const subject = "Your Client ID for Neontek CRM";
      const htmlContent = `<p>Hello ${
        client.name
      },</p><p>Your client ID is: <b>${client._id.toString()}</b></p><p>You can use this ID to log in to your client portal.</p><p>Thank you,<br>Neontek Systems</p>`;

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      await fetch(`${baseUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: client.email,
          subject: subject,
          htmlContent: htmlContent,
        }),
      });
    }

    // Always return a success message to prevent email enumeration attacks
    return NextResponse.json({
      message:
        "If your email is in our system, you will receive your ID shortly.",
    });
  } catch (error) {
    console.error("Request ID error:", error);
    // Generic error message for security
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
