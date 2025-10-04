import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ProjectModel } from "@/lib/models";
import { Types } from "mongoose";

interface LeanProject {
  _id: Types.ObjectId;
  [key: string]: any;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const activeProjects = (await ProjectModel.find({
    status: "in-progress",
  }).lean()) as LeanProject[];

  if (activeProjects.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No active projects to report on.",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const reportPromises = activeProjects.map((project) =>
    fetch(`${baseUrl}/api/projects/${project._id.toString()}/send-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
  );

  try {
    await Promise.all(reportPromises);
    return NextResponse.json({
      success: true,
      message: `Sent reports for ${activeProjects.length} projects.`,
    });
  } catch (error) {
    console.error("Error triggering reports:", error);
    return NextResponse.json(
      { error: "Failed to send all reports" },
      { status: 500 }
    );
  }
}
