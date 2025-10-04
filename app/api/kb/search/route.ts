import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { KnowledgeBaseArticleModel } from "@/lib/models";
import { NextRequest } from "next/server";

// GET /api/kb/search?q=your-query
export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const articles = await KnowledgeBaseArticleModel.find(
      {
        $text: { $search: query },
        status: "published",
      },
      {
        score: { $meta: "textScore" }, // Project a score for relevance
      }
    )
      .sort({ score: { $meta: "textScore" } }) // Sort by relevance
      .limit(3) // Return only the top 3 results
      .select("title slug"); // Only send back the title and slug

    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search articles" },
      { status: 500 }
    );
  }
}
