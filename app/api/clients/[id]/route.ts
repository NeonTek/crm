import { type NextRequest, NextResponse } from "next/server"
import { getClientById, updateClient, deleteClient } from "@/lib/data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await getClientById(params.id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const updatedClient = await updateClient(params.id, updates)
    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await deleteClient(params.id)
    if (!success) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
