import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LinkIcon,
  Clock,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/components/ui/alert-dialog";

import {
  getSession,
  confirmSession,
  cancelSession,
  checkOverlap,
  CANCEL_REASONS,
  type Session,
} from "@/lib/mockSessions";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-secondary/20 text-secondary border-secondary/30" },
  confirmed: { label: "Confirmada", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Cancelada", color: "bg-destructive/20 text-destructive border-destructive/30" },
  completed: { label: "Completada", color: "bg-primary/20 text-primary border-primary/30" },
};

const SessionConfirm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Confirm state
  const [meetingLink, setMeetingLink] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [overlap, setOverlap] = useState<Session | null>(null);

  // Cancel state
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSession(id).then((s) => {
      setSession(s);
      setLoading(false);
      if (s) {
        const ov = checkOverlap(s.tutor_id, s.start_time, s.duration_minutes, s.id);
        setOverlap(ov);
      }
    });
  }, [id]);

  const needsMeetingLink =
    session && (session.platform === "zoom" || session.platform === "custom");

  const canConfirm =
    session?.status === "pending" && (!needsMeetingLink || meetingLink.trim().length > 0);

  const handleConfirm = async () => {
    if (!session) return;
    setConfirming(true);
    try {
      const updated = await confirmSession(
        session.id,
        needsMeetingLink ? meetingLink.trim() : session.meeting_link
      );
      setSession(updated);
      toast.success("Sesión confirmada exitosamente.");
    } catch {
      toast.error("Error al confirmar la sesión.");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!session || !cancelReason) return;
    setCancelling(true);
    try {
      const updated = await cancelSession(session.id, cancelReason);
      setSession(updated);
      toast.success("Sesión cancelada.");
      setShowCancel(false);
    } catch {
      toast.error("Error al cancelar.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-2xl space-y-4 px-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Sesión no encontrada</h2>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/accounts/dashboard/tutor">Volver al dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(session.start_time);
  const status = STATUS_MAP[session.status] ?? STATUS_MAP.pending;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
          <Link to="/accounts/dashboard/tutor" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-lg font-bold text-foreground">Gestión de Sesión</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Session Details */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Detalles de la Sesión</CardTitle>
              <Badge variant="outline" className={status.color}>{status.label}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Estudiante</p>
                  <p className="font-medium text-foreground">{session.student_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Materia</p>
                  <p className="font-medium text-foreground">{session.subject}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Fecha y Hora</p>
                  <p className="font-medium text-foreground">
                    {format(startDate, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Duración</p>
                  <p className="flex items-center gap-1 font-medium text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" /> {session.duration_minutes} min
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Plataforma</p>
                  <p className="flex items-center gap-1 font-medium text-foreground">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    {session.platform === "google_meet" ? "Google Meet" : session.platform === "zoom" ? "Zoom" : "Link Personalizado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground">${session.total_price.toFixed(2)} USD</p>
                </div>
              </div>

              {session.meeting_link && session.status === "confirmed" && (
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                  <p className="text-xs uppercase tracking-wider text-primary">Link de reunión</p>
                  <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    {session.meeting_link}
                  </a>
                </div>
              )}

              {session.cancel_reason && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-xs uppercase tracking-wider text-destructive">Motivo de cancelación</p>
                  <p className="mt-1 text-sm text-foreground">{session.cancel_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overlap Warning */}
          {overlap && session.status === "pending" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-3 rounded-lg border border-secondary/40 bg-secondary/10 p-4"
              role="alert"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-secondary" />
              <div>
                <p className="text-sm font-medium text-foreground">Conflicto de horario detectado</p>
                <p className="text-xs text-muted-foreground">
                  Tienes otra sesión ({overlap.subject} con {overlap.student_name}) programada el{" "}
                  {format(new Date(overlap.start_time), "d MMM, HH:mm", { locale: es })} por {overlap.duration_minutes} min.
                </p>
              </div>
            </motion.div>
          )}

          {/* Actions for pending sessions */}
          {session.status === "pending" && (
            <Card className="border-border/50 bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meeting Link (required for zoom/custom) */}
                {needsMeetingLink && (
                  <div className="space-y-2">
                    <Label htmlFor="meeting-link" className="flex items-center gap-1">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Link de reunión <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="meeting-link"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder={
                        session.platform === "zoom"
                          ? "https://zoom.us/j/..."
                          : "https://..."
                      }
                    />
                    {!meetingLink.trim() && (
                      <p className="text-xs text-muted-foreground">
                        Debes proporcionar el link de reunión para confirmar.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirm}
                    disabled={!canConfirm || confirming}
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {confirming ? "Confirmando..." : "Confirmar Sesión"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancel(true)}
                    className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Cancel Modal */}
      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancelar Sesión
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Esta acción no se puede deshacer.</strong> La sesión con{" "}
                  {session.student_name} será cancelada permanentemente.
                </p>
                <div className="space-y-2">
                  <Label>Motivo de cancelación <span className="text-destructive">*</span></Label>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANCEL_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={!cancelReason || cancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {cancelling ? "Cancelando..." : "Sí, cancelar sesión"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SessionConfirm;
