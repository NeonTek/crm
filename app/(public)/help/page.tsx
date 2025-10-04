"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookText, Search } from "lucide-react";

interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
}

export default function HelpCenterPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/kb/public");
        if (res.ok) setArticles(await res.json());
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-2">
          Find answers and tutorials to help you get the most out of our
          services.
        </p>
      </div>
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          className="pl-10 h-12 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-center">Loading articles...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <Link href={`/help/${article.slug}`} key={article._id}>
                <Card className="h-full hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                      <BookText className="h-6 w-6 mt-1 text-primary" />
                      <span>{article.title}</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-center text-muted-foreground md:col-span-3">
              No articles found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
