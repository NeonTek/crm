import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { KnowledgeBaseArticleModel } from "@/lib/models";

// GET a single article by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const article = await KnowledgeBaseArticleModel.findById(params.id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT (update) an article
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const body = await req.json();
    // If the title is updated, regenerate the slug
    if (body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
    }

    const updatedArticle = await KnowledgeBaseArticleModel.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );
    if (!updatedArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(updatedArticle);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE an article
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const deletedArticle = await KnowledgeBaseArticleModel.findByIdAndDelete(
      params.id
    );
    if (!deletedArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
