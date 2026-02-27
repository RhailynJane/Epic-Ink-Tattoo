"use client";

import { useState } from "react";
import { Filter, Trash2, Eye, Mail, Phone } from "lucide-react";
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
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  date: string;
  message?: string;
  status: AppointmentStatus;
  createdAt: string;
}

const initialAppointments: Appointment[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    phone: "(403) 555-0123",
    email: "john.smith@email.com",
    date: "2026-03-15",
    message:
      "I'd like a sleeve tattoo with a nature theme - mountains, trees, and a wolf. Looking for black and grey realism style.",
    status: "pending",
    createdAt: "2026-02-25",
  },
  {
    id: "2",
    firstName: "Emily",
    lastName: "Johnson",
    phone: "(780) 555-0456",
    email: "emily.j@email.com",
    date: "2026-03-20",
    message: "Small floral tattoo on my wrist. First tattoo, a bit nervous!",
    status: "confirmed",
    createdAt: "2026-02-20",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Chen",
    phone: "(403) 555-0789",
    email: "m.chen@email.com",
    date: "2026-02-28",
    message: "Touch up on an existing tattoo on my forearm.",
    status: "completed",
    createdAt: "2026-02-15",
  },
];

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

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const filtered =
    statusFilter === "all"
      ? appointments
      : appointments.filter((a) => a.status === statusFilter);

  function handleStatusChange(id: string, newStatus: AppointmentStatus) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    toast.success(`Appointment ${newStatus}!`);
  }

  function handleDelete(id: string) {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setSelectedAppointment(null);
    toast.success("Appointment deleted.");
  }

  const pendingCount = appointments.filter(
    (a) => a.status === "pending"
  ).length;

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

      {/* Mobile cards view */}
      <div className="flex flex-col gap-4 md:hidden">
        {filtered.map((apt) => (
          <div
            key={apt.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {apt.firstName} {apt.lastName}
                </p>
                <p className="mt-1 text-sm text-foreground/70">{apt.date}</p>
              </div>
              {getStatusBadge(apt.status)}
            </div>
            <div className="mt-3 flex flex-col gap-1 text-sm text-foreground/70">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                {apt.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                {apt.phone}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
                onClick={() => setSelectedAppointment(apt)}
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                View
              </Button>
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
                      Delete Appointment
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Are you sure you want to delete this appointment for{" "}
                      {apt.firstName} {apt.lastName}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-muted">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(apt.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            No appointments found.
          </p>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Client</TableHead>
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((apt) => (
              <TableRow key={apt.id} className="border-border">
                <TableCell className="font-medium text-foreground">
                  {apt.firstName} {apt.lastName}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-sm text-foreground/70">
                      <Mail className="h-3 w-3" />
                      {apt.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-foreground/70">
                      <Phone className="h-3 w-3" />
                      {apt.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground/70">{apt.date}</TableCell>
                <TableCell>{getStatusBadge(apt.status)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedAppointment(apt)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
                            Delete Appointment
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete the appointment for{" "}
                            {apt.firstName} {apt.lastName}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-muted">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(apt.id)}
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

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedAppointment}
        onOpenChange={() => setSelectedAppointment(null)}
      >
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-primary">
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium text-foreground">
                    {selectedAppointment.firstName}{" "}
                    {selectedAppointment.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {selectedAppointment.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">
                    {selectedAppointment.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">
                    {selectedAppointment.phone}
                  </p>
                </div>
              </div>

              {selectedAppointment.message && (
                <div>
                  <p className="text-sm text-muted-foreground">Message</p>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-foreground/80">
                    {selectedAppointment.message}
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
                      variant={
                        selectedAppointment.status === status
                          ? "default"
                          : "outline"
                      }
                      className={
                        selectedAppointment.status === status
                          ? "bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-muted"
                      }
                      onClick={() => {
                        handleStatusChange(selectedAppointment.id, status);
                        setSelectedAppointment({
                          ...selectedAppointment,
                          status,
                        });
                      }}
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
