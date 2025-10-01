import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ClientModel as Client } from "@/lib/models";
import { getClientSession } from "@/lib/portal-auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { message: "Client ID is required" },
        { status: 400 }
      );
    }

    // Validate if the clientId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { message: "Invalid Client ID format" },
        { status: 400 }
      );
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return NextResponse.json(
        { message: "Invalid Client ID" },
        { status: 401 }
      );
    }

    const session = await getClientSession();
    session.isLoggedIn = true;
    session.clientId = client._id.toString();
    await session.save();

    return NextResponse.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
