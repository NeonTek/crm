"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

interface Article {
  id?: string;
  title: string;
  content: string;
  status: "draft" | "published";
  tags: string[];
}

interface KbArticleFormProps {
  article?: Article;
  onSuccess: () => void;
  onCancel: () => void;
}

export function KbArticleForm({
  article,
  onSuccess,
  onCancel,
}: KbArticleFormProps) {
  const [formData, setFormData] = useState({
    title: article?.title || "",
    content: article?.content || "",
    status: article?.status || "draft",
    tags: article?.tags?.join(", ") || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const articleData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      const url = article?.id ? `/api/kb/${article.id}` : "/api/kb";
      const method = article?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error(
          article?.id ? "Failed to update article" : "Failed to create article"
        );
      }

      toast({
        title: "Success",
        description: `Article ${
          article?.id ? "updated" : "created"
        } successfully.`,
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: "Could not save article.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {article?.id ? "Edit Article" : "Create New Article"}
            </CardTitle>
            <CardDescription>
              Write and publish content for your public knowledge base.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              placeholder="e.g., How to Check Your Invoice History"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              required
              rows={15}
              placeholder="Start writing your article here..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="e.g., billing, invoice, payments"
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with a comma.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === "published"}
              onCheckedChange={(checked) =>
                handleChange("status", checked ? "published" : "draft")
              }
            />
            <Label htmlFor="status">
              {formData.status === "published" ? "Published" : "Draft"}
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : article?.id
                ? "Update Article"
                : "Create Article"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
