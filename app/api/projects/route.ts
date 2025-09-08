import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Project from "@/models/Project"

// GET /api/projects - Fetch all projects with client info
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Projects API: Fetching all projects")
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clientId = searchParams.get("client")

    const filter: any = {}
    if (status && status !== "all") {
      filter.status = status
    }
    if (clientId) {
      filter.client = clientId
    }

    console.log("[v0] Projects filter:", filter)
    const projects = await Project.find(filter).populate("client", "name email").sort({ createdAt: -1 })
    console.log("[v0] Projects API: Found", projects.length, "projects")

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Projects API: Creating new project")
    await dbConnect()
    const body = await request.json()
    console.log("[v0] Project data received:", body)

    const requiredFields = ["name", "description", "client", "status"]
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

    const project = new Project(body)
    await project.save()
    console.log("[v0] Project created successfully:", project._id)

    const populatedProject = await Project.findById(project._id).populate("client", "name email")

    return NextResponse.json(populatedProject, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating project:", error)

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: "Failed to create project",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
