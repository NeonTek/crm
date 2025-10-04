"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { KbArticleForm } from "./kb-article-form";

interface Article {
  id: string;
  title: string;
  status: "draft" | "published";
  tags: string[];
  updatedAt: string;
}

export function KbArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const { toast } = useToast();

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/kb");
      if (res.ok) setArticles(await res.json());
    } catch (error) {
      console.error("Failed to fetch articles", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArticle(undefined);
    fetchArticles();
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = async (articleId: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        const res = await fetch(`/api/kb/${articleId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete article");
        toast({ title: "Success", description: "Article deleted." });
        fetchArticles();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not delete article.",
          variant: "destructive",
        });
      }
    }
  };

  if (showForm) {
    return (
      <KbArticleForm
        article={editingArticle}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingArticle(undefined);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Knowledge Base
          </h2>
          <p className="text-muted-foreground">
            Create and manage articles for your public help center.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p>Loading articles...</p>
          ) : articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Last updated:{" "}
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        article.status === "published" ? "default" : "secondary"
                      }
                    >
                      {article.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No articles found</h3>
              <p className="text-muted-foreground my-2">
                Get started by creating your first knowledge base article.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
