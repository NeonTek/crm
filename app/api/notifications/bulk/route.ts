import { type NextRequest, NextResponse } from "next/server";
import { getClients } from "@/lib/data";
import nodemailer from "nodemailer";
import type { Client } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { clientIds, subject, htmlContent } = await request.json();

    if (
      !clientIds ||
      !subject ||
      !htmlContent ||
      !Array.isArray(clientIds) ||
      clientIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields or no clients selected",
        },
        { status: 400 }
      );
    }

    const allClients = await getClients();
    const selectedClients = allClients.filter((client: Client) =>
      clientIds.includes(client.id)
    );

    if (selectedClients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid clients found for the provided IDs",
        },
        { status: 404 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "mail.neontek.co.ke",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || "no-reply@neontek.co.ke",
        pass: process.env.EMAIL_PASS || "",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const emailPromises = selectedClients.map((client: Client) => {
      return transporter.sendMail({
        from: `"NeonTek CRM" <no-reply@neontek.co.ke>`,
        to: client.email,
        subject,
        html: htmlContent,
      });
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully sent emails to ${selectedClients.length} clients.`,
    });
  } catch (error: unknown) {
    console.error("Email sending error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message: "Failed to send emails", error: errorMessage },
      { status: 500 }
    );
  }
}
