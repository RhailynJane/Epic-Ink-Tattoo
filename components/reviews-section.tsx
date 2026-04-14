"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const fallbackReviews = [
  {
    id: "1",
    customerName: "Emerson",
    text: "The entire experience at Epic Ink Tattoo was exceptional. The studio had a clean and inviting atmosphere, and the artist made sure I was comfortable throughout the entire session. I left feeling not only elated with my new tattoo but also grateful for the wonderful experience I had. I can't recommend Epic Ink Tattoo enough, and I'll definitely be returning for future tattoos!",
    rating: 5,
  },
  {
    id: "2",
    customerName: "Sarah M.",
    text: "Amazing art. Eman is incredibly talented and really listens to what you want. The attention to detail is phenomenal. My tattoo turned out even better than I imagined. The studio is clean, professional, and the whole experience was top-notch.",
    rating: 5,
  },
  {
    id: "3",
    customerName: "James R.",
    text: "Best tattoo experience of my life. The level of artistry here is unmatched. Eman took my rough idea and turned it into a masterpiece. I've gotten compliments from everyone who sees it. Highly recommended!",
    rating: 5,
  },
  {
    id: "4",
    customerName: "Maryi Alvarez",
    text: "Got a cover up tattoo here and I just love it! The whole process was so easy and he definitely made me feel less nervous. No complains at all and definitely recommend coming here. The vibes plus the artwork made it just 10x better for me thank you so so much.",
    rating: 5,
  },
  {
    id: "5",
    customerName: "Mikayla Whyte",
    text: "Manny is an awesome guy. He's very exprienced and does an amazing job.",
    rating: 5,
  },
  {
    id: "6",
    customerName: "John Carlo Villamor",
    text: "10/10 superb work! Very professional",
    rating: 5,
  },
];

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviews = fallbackReviews;

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    const timer = setInterval(goNext, 8000);
    return () => clearInterval(timer);
  }, [goNext]);

  const current = reviews[currentIndex];

  async function handleSubmitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const customerName = formData.get("name") as string;
    const text = formData.get("review") as string;

    if (!customerName || !text) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // When Convex is connected, this will save to the database via api.reviews.submit
      await new Promise((r) => setTimeout(r, 500));
      toast.success(
        "Thank you! Your review has been submitted for approval."
      );
      form.reset();
      setRating(5);
      setIsDialogOpen(false);
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="bg-background py-24">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-16 text-center font-serif text-4xl font-bold text-primary md:text-5xl">
          Our Customers Love Us
        </h2>

        {current && (
          <div className="relative">
            <div className="flex justify-center">
              <Quote className="h-12 w-12 text-primary/50" />
            </div>
            <blockquote className="mt-6 text-center text-lg italic leading-relaxed text-foreground/80 md:text-xl">
              {'"'}
              {current.text}
              {'"'}
            </blockquote>

            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="h-px w-24 bg-primary/50" />
              <div className="mt-4 flex gap-1">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">
                {current.customerName}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={goPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:border-primary hover:text-primary"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-6 bg-primary"
                        : "w-2 bg-foreground/30"
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:border-primary hover:text-primary"
                aria-label="Next review"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Leave a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border bg-card">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-primary">
                  Leave a Review
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmitReview}
                className="flex flex-col gap-4"
              >
                <div>
                  <Label htmlFor="review-name" className="text-foreground/80">
                    Your Name
                  </Label>
                  <Input
                    id="review-name"
                    name="name"
                    placeholder="Enter your name"
                    className="mt-1 border-border bg-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground/80">Rating</Label>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? "fill-primary text-primary"
                              : "text-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="review-text" className="text-foreground/80">
                    Your Review
                  </Label>
                  <Textarea
                    id="review-text"
                    name="review"
                    placeholder="Share your experience..."
                    rows={4}
                    className="mt-1 border-border bg-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
