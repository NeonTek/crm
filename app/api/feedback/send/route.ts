import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ProjectModel, ClientModel } from "@/lib/models";
import type { Project, Client } from "@/lib/types";

export async function POST(req: Request) {
  await connectDB();
  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = (await ProjectModel.findById(
      projectId
    ).lean()) as Project | null;
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch the client directly as a full Mongoose document (no .lean())
    const client = await ClientModel.findById(project.clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    // Now, client.id will be correctly populated from the Mongoose document
    const feedbackLink = `${baseUrl}/feedback/${projectId}?clientId=${client.id}`;

    const subject = `We'd Love Your Feedback on the "${project.name}" Project!`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <div style="background: #00BFFF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>Project Completed!</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #00BFFF;">Tell Us What You Think</h2>
            <p>Hello ${client.name},</p>
            <p>We're excited to let you know that the <strong>${project.name}</strong> project has now been completed! We hope you're happy with the results.</p>
            <p>To help us improve our services, we would be grateful if you could take a moment to share your feedback. It will only take a minute.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${feedbackLink}" style="background-color: #00BFFF; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Leave Feedback</a>
            </div>
            <p>Your input is incredibly valuable to us. Thank you for your partnership!</p>
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
      message: "Feedback email sent successfully.",
    });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return NextResponse.json(
      { error: "Failed to send feedback email" },
      { status: 500 }
    );
  }
}
