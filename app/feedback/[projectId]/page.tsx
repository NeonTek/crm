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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Star, CheckCircle, MessageSquare, PartyPopper } from "lucide-react";

// Helper component for the star rating
const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) => (
  <div className="flex justify-center gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-10 w-10 cursor-pointer transition-colors ${
          rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
        onClick={() => setRating(star)}
      />
    ))}
  </div>
);

export default function FeedbackPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientName, setClientName] = useState("");
  const { toast } = useToast();

  // Extract client ID from URL query parameters
  const clientId = new URLSearchParams(window.location.search).get("clientId");

  useEffect(() => {
    // A real app would fetch client/project names here, but we'll keep it simple
    setClientName("Valued Client");
  }, []);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          feedback,
          clientId,
          projectId: params.projectId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback.");
      }

      const data = await res.json();
      setFeedbackId(data.id); // Save the ID for the testimonial step

      if (rating >= 4) {
        setStep(2); // Move to testimonial step
      } else {
        setStep(3); // Go directly to thank you step
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestimonialSubmit = async () => {
    if (!testimonial.trim()) {
      setStep(3); // Skip if empty and go to thank you
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId, testimonial }),
      });
      if (!res.ok) throw new Error("Failed to submit testimonial.");
      setStep(3); // Move to final thank you step
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not submit your testimonial.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Rating & Feedback
        return (
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
              <CardDescription>
                How would you rate your experience with us on this project?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <StarRating rating={rating} setRating={setRating} />
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional: Tell us more about your experience..."
                rows={4}
              />
              <Button
                onClick={handleRatingSubmit}
                disabled={isSubmitting || rating === 0}
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardContent>
          </Card>
        );
      case 2: // Testimonial
        return (
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <PartyPopper className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-2xl">
                Thank you for the high rating!
              </CardTitle>
              <CardDescription>
                Would you be willing to share a brief testimonial about your
                experience? Your words help others know what it's like to work
                with us.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="e.g., 'Working with NeonTek was a fantastic experience...'"
                rows={5}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleTestimonialSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Saving..." : "Submit Testimonial"}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="w-full"
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 3: // Thank You
        return (
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-2xl">Thank You!</CardTitle>
              <CardDescription>
                Your feedback has been received. We appreciate you taking the
                time to help us improve.
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      {renderStep()}
    </div>
  );
}
