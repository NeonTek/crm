import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Task from "@/models/Task"
import mongoose from "mongoose"

// GET /api/tasks/[id] - Fetch single task
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const task = await Task.findById(params.id).populate({
      path: "project",
      select: "name client",
      populate: { path: "client", select: "name" },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const body = await request.json()

    const task = await Task.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).populate({
      path: "project",
      select: "name client",
      populate: { path: "client", select: "name" },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error: any) {
    console.error("Error updating task:", error)

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const task = await Task.findByIdAndDelete(params.id)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
