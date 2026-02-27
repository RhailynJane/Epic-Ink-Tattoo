"use client";

import { useState } from "react";
import { Check, X, Trash2, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ReviewStatus = "pending" | "approved" | "rejected";

interface Review {
  id: string;
  customerName: string;
  text: string;
  rating: number;
  status: ReviewStatus;
  createdAt: string;
}

const initialReviews: Review[] = [
  {
    id: "1",
    customerName: "Emerson",
    text: "The entire experience at Epic Ink Tattoo was exceptional. The studio had a clean and inviting atmosphere, and the artist made sure I was comfortable throughout the entire session.",
    rating: 5,
    status: "approved",
    createdAt: "2025-12-15",
  },
  {
    id: "2",
    customerName: "Sarah M.",
    text: "Amazing art. Eman is incredibly talented and really listens to what you want. The attention to detail is phenomenal.",
    rating: 5,
    status: "approved",
    createdAt: "2026-01-10",
  },
  {
    id: "3",
    customerName: "James R.",
    text: "Best tattoo experience of my life. The level of artistry here is unmatched.",
    rating: 5,
    status: "approved",
    createdAt: "2026-02-01",
  },
  {
    id: "4",
    customerName: "Alex P.",
    text: "Great studio, very clean and professional. I love my new tattoo!",
    rating: 4,
    status: "pending",
    createdAt: "2026-02-20",
  },
];

function getStatusBadge(status: ReviewStatus) {
  switch (status) {
    case "approved":
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="border-red-500/30 bg-red-500/20 text-red-400">
          Rejected
        </Badge>
      );
    case "pending":
      return (
        <Badge className="border-amber-500/30 bg-amber-500/20 text-amber-400">
          Pending
        </Badge>
      );
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered =
    statusFilter === "all"
      ? reviews
      : reviews.filter((r) => r.status === statusFilter);

  function handleApprove(id: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved" as ReviewStatus } : r
      )
    );
    toast.success("Review approved!");
  }

  function handleReject(id: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "rejected" as ReviewStatus } : r
      )
    );
    toast.success("Review rejected.");
  }

  function handleDelete(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Review deleted.");
  }

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Reviews
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage customer reviews and feedback.
            {pendingCount > 0 && (
              <span className="ml-2 font-medium text-amber-400">
                {pendingCount} pending review{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 border-border bg-input text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card">
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile cards view */}
      <div className="flex flex-col gap-4 md:hidden">
        {filtered.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {review.customerName}
                </p>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-primary text-primary"
                    />
                  ))}
                </div>
              </div>
              {getStatusBadge(review.status)}
            </div>
            <p className="mt-3 text-sm text-foreground/70">{review.text}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {review.createdAt}
              </span>
              <div className="flex gap-1">
                {review.status !== "approved" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => handleApprove(review.id)}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                )}
                {review.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-amber-400 hover:bg-amber-500/10"
                    onClick={() => handleReject(review.id)}
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-border bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">
                        Delete Review
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Are you sure you want to delete this review from{" "}
                        {review.customerName}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-muted">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(review.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Review</TableHead>
              <TableHead className="text-muted-foreground">Rating</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((review) => (
              <TableRow key={review.id} className="border-border">
                <TableCell className="font-medium text-foreground">
                  {review.customerName}
                </TableCell>
                <TableCell className="max-w-sm text-foreground/70">
                  <p className="line-clamp-2">{review.text}</p>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(review.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {review.createdAt}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {review.status !== "approved" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                        onClick={() => handleApprove(review.id)}
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                        onClick={() => handleReject(review.id)}
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-border bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">
                            Delete Review
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete this review from{" "}
                            {review.customerName}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-muted">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(review.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  No reviews found with the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
