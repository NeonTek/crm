import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Task from "@/models/Task"

// GET /api/tasks - Fetch tasks with optional project filter
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Tasks API: Fetching tasks")
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("project")

    const filter: any = {}
    if (projectId) {
      filter.project = projectId
    }

    console.log("[v0] Tasks filter:", filter)
    const tasks = await Task.find(filter)
      .populate({
        path: "project",
        select: "name client",
        populate: { path: "client", select: "name" },
      })
      .sort({ createdAt: -1 })

    console.log("[v0] Tasks API: Found", tasks.length, "tasks")
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[v0] Error fetching tasks:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Tasks API: Creating new task")
    await dbConnect()
    const body = await request.json()
    console.log("[v0] Task data received:", body)

    const requiredFields = ["title", "project", "status"]
    const missingFields = requiredFields.filter(
      (field) => !body[field] || (typeof body[field] === "string" && body[field].trim() === ""),
    )

    if (missingFields.length > 0) {
      console.log("[v0] Missing required fields:", missingFields)
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const task = new Task(body)
    await task.save()
    console.log("[v0] Task created successfully:", task._id)

    const populatedTask = await Task.findById(task._id).populate({
      path: "project",
      select: "name client",
      populate: { path: "client", select: "name" },
    })

    return NextResponse.json(populatedTask, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating task:", error)

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: "Failed to create task",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
