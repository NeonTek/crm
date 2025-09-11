import { type NextRequest, NextResponse } from "next/server"
import { updateTask, deleteTask } from "@/lib/data"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const updatedTask = await updateTask(params.id, updates)
    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const updatedTask = await updateTask(params.id, updates)
    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await deleteTask(params.id)
    if (!success) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
