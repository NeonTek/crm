import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Client from "@/models/Client"

// GET /api/clients - Fetch all clients
export async function GET() {
  try {
    console.log("[v0] Clients API: Fetching all clients")
    await dbConnect()
    const clients = await Client.find().sort({ createdAt: -1 })
    console.log("[v0] Clients API: Found", clients.length, "clients")
    return NextResponse.json(clients)
  } catch (error) {
    console.error("[v0] Error fetching clients:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch clients",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Clients API: Creating new client")
    await dbConnect()
    const body = await request.json()
    console.log("[v0] Client data received:", body)

    const requiredFields = ["name", "contactPerson", "email", "phone", "address"]
    const missingFields = requiredFields.filter((field) => !body[field] || body[field].trim() === "")

    if (missingFields.length > 0) {
      console.log("[v0] Missing required fields:", missingFields)
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const client = new Client(body)
    await client.save()
    console.log("[v0] Client created successfully:", client._id)

    return NextResponse.json(client, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating client:", error)

    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: "Failed to create client",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
