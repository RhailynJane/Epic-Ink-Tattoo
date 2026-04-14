"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X, Trash2, Star, Filter, Loader2 } from "lucide-react";
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
  _id: string;
  customerName: string;
  text: string;
  rating: number;
  status: ReviewStatus;
  createdAt: number;
}

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

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mutating, setMutating] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load reviews.");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load.");
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = useMemo(() => {
    if (!reviews) return [];
    return statusFilter === "all"
      ? reviews
      : reviews.filter((r) => r.status === statusFilter);
  }, [reviews, statusFilter]);

  const pendingCount = useMemo(
    () => reviews?.filter((r) => r.status === "pending").length ?? 0,
    [reviews]
  );

  async function handleStatusChange(id: string, newStatus: ReviewStatus) {
    setMutating(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update.");
      setReviews((prev) =>
        prev ? prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)) : prev
      );
      toast.success(
        newStatus === "approved"
          ? "Review approved."
          : newStatus === "rejected"
            ? "Review rejected."
            : "Review set to pending."
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setMutating(null);
    }
  }

  async function handleDelete(id: string) {
    setMutating(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      setReviews((prev) => (prev ? prev.filter((r) => r._id !== id) : prev));
      toast.success("Review deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setMutating(null);
    }
  }

  const loading = reviews === null;

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

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Mobile cards view */}
      {!loading && (
        <div className="flex flex-col gap-4 md:hidden">
          {filtered.map((review) => (
            <div
              key={review._id}
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
                  {formatDate(review.createdAt)}
                </span>
                <div className="flex gap-1">
                  {review.status !== "approved" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={mutating === review._id}
                      className="text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => handleStatusChange(review._id, "approved")}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Approve
                    </Button>
                  )}
                  {review.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={mutating === review._id}
                      className="text-amber-400 hover:bg-amber-500/10"
                      onClick={() => handleStatusChange(review._id, "rejected")}
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
                        disabled={mutating === review._id}
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
                          onClick={() => handleDelete(review._id)}
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
      )}

      {/* Desktop table view */}
      {!loading && (
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
                <TableRow key={review._id} className="border-border">
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
                    {formatDate(review.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {review.status !== "approved" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={mutating === review._id}
                          className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                          onClick={() => handleStatusChange(review._id, "approved")}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {review.status !== "rejected" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={mutating === review._id}
                          className="h-8 w-8 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                          onClick={() => handleStatusChange(review._id, "rejected")}
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
                            disabled={mutating === review._id}
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
                              onClick={() => handleDelete(review._id)}
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
      )}
    </div>
  );
}
