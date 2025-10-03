"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { Testimonial } from "@/lib/types";
import { Star } from "lucide-react";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" });
      if (res.ok) setTestimonials(await res.json());
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handlePublishToggle = async (
    testimonialId: string,
    isPublic: boolean
  ) => {
    // Optimistic UI update
    setTestimonials((prev) =>
      prev.map((t) => (t.id === testimonialId ? { ...t, isPublic } : t))
    );

    try {
      const res = await fetch(`/api/testimonials/${testimonialId}`, {
        // We need to create this API route
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({ title: "Success", description: "Testimonial status updated." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update status.",
        variant: "destructive",
      });
      // Revert UI on failure
      fetchTestimonials();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Client Feedback & Testimonials</h2>
      </div>
      <p className="text-muted-foreground">
        Review client feedback and manage public testimonials for your website.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Collected Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading testimonials...</p>
          ) : testimonials.length > 0 ? (
            <div className="space-y-6">
              {testimonials.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {item.clientName}
                        </CardTitle>
                        <CardDescription>
                          From project: {item.projectName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`publish-${item.id}`}>Publish</Label>
                        <Switch
                          id={`publish-${item.id}`}
                          checked={item.isPublic}
                          onCheckedChange={(checked) =>
                            handlePublishToggle(item.id, checked)
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            item.rating > i
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <blockquote className="border-l-4 pl-4 italic">
                      "{item.testimonial}"
                    </blockquote>
                    {item.feedback && (
                      <p className="text-sm text-muted-foreground mt-4">
                        <strong>Additional Feedback:</strong> {item.feedback}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No testimonials have been collected yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
