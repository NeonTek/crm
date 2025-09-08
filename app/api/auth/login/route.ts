import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login API: Starting login")

    try {
      await dbConnect()
      console.log("[v0] Database connected successfully")
    } catch (dbError) {
      console.error("[v0] Database connection failed:", dbError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    let requestData
    try {
      requestData = await request.json()
      console.log("[v0] Login request received for email:", requestData.email)
    } catch (parseError) {
      console.error("[v0] Failed to parse request JSON:", parseError)
      return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
    }

    const { email, password } = requestData

    // Validate required fields
    if (!email || !password) {
      console.log("[v0] Missing required fields:", { email: !!email, password: !!password })
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log("[v0] User not found:", email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      console.log("[v0] Invalid password for user:", email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("[v0] User logged in successfully:", user.email)

    let token
    try {
      token = generateToken(user)
      console.log("[v0] Token generated successfully")
    } catch (tokenError) {
      console.error("[v0] Token generation failed:", tokenError)
      return NextResponse.json({ error: "Authentication setup failed" }, { status: 500 })
    }

    // Create response with user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    const response = NextResponse.json({
      message: "Login successful",
      user: userData,
      token,
    })

    // Set HTTP-only cookie for browser
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[v0] Login error:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Login failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
