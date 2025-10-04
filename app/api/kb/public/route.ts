import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { KnowledgeBaseArticleModel } from "@/lib/models";

// GET all PUBLISHED knowledge base articles
export async function GET() {
  await connectDB();
  try {
    const articles = await KnowledgeBaseArticleModel.find({
      status: "published",
    }).sort({ createdAt: -1 });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
