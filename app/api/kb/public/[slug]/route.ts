import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { KnowledgeBaseArticleModel } from "@/lib/models";

// GET a single published article by its slug
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  await connectDB();
  try {
    const article = await KnowledgeBaseArticleModel.findOne({
      slug: params.slug,
      status: "published",
    });
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
