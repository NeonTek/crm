import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Client from "@/models/Client"
import Project from "@/models/Project"
import mongoose from "mongoose"

// GET /api/clients/[id] - Fetch single client with projects
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 })
    }

    const client = await Client.findById(params.id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const projects = await Project.find({ client: params.id }).sort({ createdAt: -1 })

    return NextResponse.json({ client, projects })
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

// PUT /api/clients/[id] - Update client
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 })
    }

    const body = await request.json()

    const client = await Client.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error: any) {
    console.error("Error updating client:", error)

    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 })
    }

    // Check if client has projects
    const projectCount = await Project.countDocuments({ client: params.id })
    if (projectCount > 0) {
      return NextResponse.json({ error: "Cannot delete client with existing projects" }, { status: 400 })
    }

    const client = await Client.findByIdAndDelete(params.id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
