import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Task from "@/models/Task";

export async function GET() {
  try {
    console.log("Dashboard API: Starting data fetch");
    await dbConnect();
    console.log("Dashboard API: Database connected");

    // Get current date for calculations
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const [
      totalClients,
      activeProjects,
      tasksDueThisWeek,
      expiringServices,
      recentClients,
      recentProjects,
      upcomingTasks,
      expiringDomains,
      expiringHosting,
    ] = await Promise.allSettled([
      Client.countDocuments(),
      Project.countDocuments({ status: { $in: ["Planning", "In Progress"] } }),
      Task.countDocuments({
        status: { $ne: "Done" },
        dueDate: { $lte: oneWeekFromNow, $gte: now },
      }),
      Project.countDocuments({
        $or: [
          { domainExpiry: { $lte: thirtyDaysFromNow, $gte: now } },
          { hostingExpiry: { $lte: thirtyDaysFromNow, $gte: now } },
        ],
      }),
      Client.find().sort({ createdAt: -1 }).limit(5).select("name createdAt"),
      Project.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client", "name")
        .select("name status createdAt client"),
      Task.find({ status: { $ne: "Done" }, dueDate: { $gte: now } })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate({
          path: "project",
          select: "name client",
          populate: { path: "client", select: "name" },
        })
        .select("title dueDate status project"),
      Project.find({
        domainExpiry: { $lte: thirtyDaysFromNow, $gte: now },
      })
        .sort({ domainExpiry: 1 })
        .populate("client", "name")
        .select("name domainExpiry client"),
      Project.find({
        hostingExpiry: { $lte: thirtyDaysFromNow, $gte: now },
      })
        .sort({ hostingExpiry: 1 })
        .populate("client", "name")
        .select("name hostingExpiry client"),
    ]);

    const safeExtract = (
      result: PromiseSettledResult<any>,
      fallback: any = 0
    ) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        console.error("Dashboard query failed:", result.reason);
        return fallback;
      }
    };

    const metrics = {
      totalClients: safeExtract(totalClients, 0),
      activeProjects: safeExtract(activeProjects, 0),
      tasksDueThisWeek: safeExtract(tasksDueThisWeek, 0),
      expiringServices: safeExtract(expiringServices, 0),
    };

    const clientsData = safeExtract(recentClients, []);
    const projectsData = safeExtract(recentProjects, []);

    // Combine recent activity
    const recentActivity = [
      ...clientsData.map((client: any) => ({
        type: "client",
        message: `New client "${client.name}" added`,
        date: client.createdAt,
      })),
      ...projectsData.map((project: any) => ({
        type: "project",
        message: `Project "${project.name}" created for ${
          project.client?.name || "Unknown Client"
        }`,
        date: project.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const responseData = {
      metrics,
      recentActivity,
      upcomingDeadlines: {
        tasks: safeExtract(upcomingTasks, []),
        domains: safeExtract(expiringDomains, []),
        hosting: safeExtract(expiringHosting, []),
      },
    };

    console.log("Dashboard API: Data fetched successfully", metrics);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
