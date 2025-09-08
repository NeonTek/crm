import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Project from "@/models/Project"
import Task from "@/models/Task"
import mongoose from "mongoose"

// GET /api/projects/[id] - Fetch single project with client and tasks
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
    }

    const project = await Project.findById(params.id).populate("client", "name email phone")
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const tasks = await Task.find({ project: params.id }).sort({ createdAt: -1 })

    return NextResponse.json({ project, tasks })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
    }

    const body = await request.json()

    const project = await Project.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).populate("client", "name email")

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error: any) {
    console.error("Error updating project:", error)

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: params.id })

    const project = await Project.findByIdAndDelete(params.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Project and associated tasks deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
