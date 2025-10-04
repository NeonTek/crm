// File: app/(public)/help/[slug]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Article {
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/kb/public/${params.slug}`);
        if (res.ok) {
          setArticle(await res.json());
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch article", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [params.slug]);

  if (isLoading) {
    return <p className="text-center">Loading article...</p>;
  }

  if (!article) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/help"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Help Center
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{article.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(article.updatedAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
