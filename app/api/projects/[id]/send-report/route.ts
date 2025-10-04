import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ProjectModel, ClientModel, TaskModel } from "@/lib/models";
import type { Task } from "@/lib/types";

// Helper function to calculate task progress
const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completedTasks / tasks.length) * 100);
};

// Helper function to generate the email HTML
const generateReportHTML = (
  clientName: string,
  projectName: string,
  progress: number,
  completedTasks: Task[],
  upcomingTasks: Task[]
) => {
  const completedItems =
    completedTasks.length > 0
      ? completedTasks.map((task) => `<li>✅ ${task.title}</li>`).join("")
      : "<li>No new tasks were completed this week.</li>";

  const upcomingItems =
    upcomingTasks.length > 0
      ? upcomingTasks
          .map(
            (task) =>
              `<li>⏳ ${task.title} (Status: ${task.status.replace(
                "-",
                " "
              )})</li>`
          )
          .join("")
      : "<li>All tasks are on track!</li>";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
      <div style="background: #00BFFF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1>Weekly Project Update</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00BFFF;">Progress Report for: ${projectName}</h2>
        <p>Hello ${clientName},</p>
        <p>Here’s a summary of the progress made on your project over the past week.</p>

        <h3 style="color: #333;">Overall Progress: ${progress}%</h3>
        <div style="background: #f4f4f4; border-radius: 5px; height: 24px; width: 100%;">
          <div style="background: #00BFFF; width: ${progress}%; height: 100%; border-radius: 5px;"></div>
        </div>

        <h3 style="color: #333; margin-top: 30px;">Completed This Week</h3>
        <ul style="list-style: none; padding-left: 0;">${completedItems}</ul>

        <h3 style="color: #333; margin-top: 30px;">What's Next</h3>
        <ul style="list-style: none; padding-left: 0;">${upcomingItems}</ul>

        <p style="margin-top: 30px;">If you have any questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br>The NeonTek Team</p>
      </div>
    </div>
  `;
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const projectId = params.id;

    // Fetch the project once, WITHOUT .lean()
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch client and tasks in parallel, WITHOUT .lean()
    const [client, tasks] = await Promise.all([
      ClientModel.findById(project.clientId),
      TaskModel.find({ projectId }),
    ]);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const completedThisWeek = tasks.filter(
      (task) =>
        task.status === "completed" && new Date(task.updatedAt) > oneWeekAgo
    );

    const upcomingTasks = tasks.filter(
      (task) => task.status === "todo" || task.status === "in-progress"
    );

    const progress = calculateProgress(tasks);

    const subject = `Weekly Update for: ${project.name}`;
    const htmlContent = generateReportHTML(
      client.name,
      project.name,
      progress,
      completedThisWeek,
      upcomingTasks
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: client.email, subject, htmlContent }),
    });

    return NextResponse.json({
      success: true,
      message: `Report sent for ${project.name}`,
    });
  } catch (error) {
    console.error("Error sending report:", error);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 }
    );
  }
}
