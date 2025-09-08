import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Register API: Starting registration")

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
      console.log("[v0] Request data received:", { ...requestData, password: "[HIDDEN]" })
    } catch (parseError) {
      console.error("[v0] Failed to parse request JSON:", parseError)
      return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
    }

    const { name, email, password } = requestData

    // Validate required fields
    if (!name || !email || !password) {
      console.log("[v0] Missing required fields:", { name: !!name, email: !!email, password: !!password })
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log("[v0] User already exists:", email)
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "user", // Default role
    })

    await user.save()
    console.log("[v0] User registered successfully:", user.email)

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

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: userData,
        token,
      },
      { status: 201 },
    )

    // Set HTTP-only cookie for browser
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[v0] Registration error:", error)
    console.error("[v0] Error stack:", error.stack)

    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: "Registration failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
