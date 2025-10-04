"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Testimonial } from "@/lib/types";
import { Star } from "lucide-react";
import Image from "next/image";

export default function PublicTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials/public");
        if (res.ok) {
          setTestimonials(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch public testimonials", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="bg-muted/40 min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto flex items-center gap-6">
            <a href="https://neontek.co.ke" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="NeonTek Logo"
                width={100}
                height={30}
                className="dark:invert"
              />
            </a>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            What Our Clients Say
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We're proud to have worked with some amazing clients. Here's what
            they think of our work.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">
            Loading testimonials...
          </p>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-1">
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
                </CardHeader>
                <CardContent className="flex-1">
                  <blockquote className="italic text-lg">
                    "{item.testimonial}"
                  </blockquote>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <p className="font-semibold text-lg">{item.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    From project: {item.projectName}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No Testimonials Yet</h2>
            <p className="mt-2 text-muted-foreground">
              Check back soon to see what our clients are saying about us!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
