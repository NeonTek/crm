import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("Logout API: Logging out user");

    const response = NextResponse.json({
      message: "Logout successful",
    });

    // Clear the authentication cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
