import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { KnowledgeBaseArticleModel } from "@/lib/models";

// GET all knowledge base articles (for admin)
export async function GET() {
  await connectDB();
  try {
    const articles = await KnowledgeBaseArticleModel.find({}).sort({
      createdAt: -1,
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST a new knowledge base article
export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const slug = body.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const newArticle = await KnowledgeBaseArticleModel.create({
      ...body,
      slug,
    });
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
