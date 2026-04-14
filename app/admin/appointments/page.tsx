"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Filter,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Appointment {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  date: string;
  time?: string;
  message?: string;
  status: AppointmentStatus;
  createdAt: number;
}

function getStatusBadge(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return (
        <Badge className="border-amber-500/30 bg-amber-500/20 text-amber-400">
          Pending
        </Badge>
      );
    case "confirmed":
      return (
        <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-400">
          Confirmed
        </Badge>
      );
    case "completed":
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
          Completed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="border-red-500/30 bg-red-500/20 text-red-400">
          Cancelled
        </Badge>
      );
  }
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return d;
  const date = new Date(Date.UTC(y, m - 1, day));
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [mutating, setMutating] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/appointments", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load appointments.");
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load.");
      setAppointments([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!appointments) return [];
    return statusFilter === "all"
      ? appointments
      : appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  const pendingCount = useMemo(
    () => appointments?.filter((a) => a.status === "pending").length ?? 0,
    [appointments]
  );

  async function handleStatusChange(id: string, newStatus: AppointmentStatus) {
    setMutating(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          if (data?.error) detail = data.error;
        } catch {}
        throw new Error(`Failed to update: ${detail}`);
      }
      setAppointments((prev) =>
        prev ? prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a)) : prev
      );
      setSelected((prev) => (prev && prev._id === id ? { ...prev, status: newStatus } : prev));
      const notice =
        newStatus === "pending"
          ? "Set back to pending."
          : `Marked ${newStatus} — confirmation email queued to client.`;
      toast.success(notice);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setMutating(null);
    }
  }

  async function handleDelete(id: string) {
    setMutating(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete.");
      setAppointments((prev) => (prev ? prev.filter((a) => a._id !== id) : prev));
      if (selected?._id === id) setSelected(null);
      toast.success("Appointment deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setMutating(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Appointments
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage customer appointment bookings.
            {pendingCount > 0 && (
              <span className="ml-2 font-medium text-amber-400">
                {pendingCount} pending
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
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {appointments === null ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-4 md:hidden">
            {filtered.map((apt) => (
              <div
                key={apt._id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {apt.firstName} {apt.lastName}
                    </p>
                    <p className="mt-1 text-sm text-foreground/70">
                      {formatDate(apt.date)}
                      {apt.time ? ` · ${apt.time}` : ""}
                    </p>
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
                <div className="mt-3 flex flex-col gap-1 text-sm text-foreground/70">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> {apt.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    {apt.phone || "—"}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted"
                    onClick={() => setSelected(apt)}
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" /> View
                  </Button>
                  <DeleteButton
                    apt={apt}
                    disabled={mutating === apt._id}
                    onConfirm={() => handleDelete(apt._id)}
                  />
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                No appointments found.
              </p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Client</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground">When</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((apt) => (
                  <TableRow key={apt._id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {apt.firstName} {apt.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-sm text-foreground/70">
                          <Mail className="h-3 w-3" /> {apt.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-foreground/70">
                          <Phone className="h-3 w-3" /> {apt.phone || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/70">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        {formatDate(apt.date)}
                      </div>
                      {apt.time && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {apt.time}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelected(apt)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DeleteButton
                          apt={apt}
                          disabled={mutating === apt._id}
                          onConfirm={() => handleDelete(apt._id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No appointments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-primary">
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium text-foreground">
                    {selected.firstName} {selected.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {formatDate(selected.date)}
                    {selected.time ? ` · ${selected.time}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-primary hover:underline"
                    >
                      {selected.email}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">
                    {selected.phone ? (
                      <a
                        href={`tel:${selected.phone.replace(/[^0-9+]/g, "")}`}
                        className="text-primary hover:underline"
                      >
                        {selected.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>

              {selected.message && (
                <div>
                  <p className="text-sm text-muted-foreground">Message</p>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-foreground/80">
                    {selected.message}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["pending", "confirmed", "completed", "cancelled"] as const
                  ).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      disabled={mutating === selected._id}
                      variant={selected.status === status ? "default" : "outline"}
                      className={
                        selected.status === status
                          ? "bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-muted"
                      }
                      onClick={() => handleStatusChange(selected._id, status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeleteButton({
  apt,
  disabled,
  onConfirm,
}: {
  apt: Appointment;
  disabled: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          disabled={disabled}
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="Delete"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Delete Appointment
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Remove the appointment for {apt.firstName} {apt.lastName}? This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-muted">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
