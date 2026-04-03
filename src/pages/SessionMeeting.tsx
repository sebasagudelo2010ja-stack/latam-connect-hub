import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInSeconds } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  Video,
  Copy,
  CheckCircle2,
  Star,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowLeft,
  Headphones,
  Send,
  Sparkles,
  CalendarPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getSession,
  completeSession,
  reportSessionIssue,
  type Session,
} from "@/lib/mockSessions";
import { useAuthStore } from "@/stores/authStore";

// ─── Border Beam component ───
const BorderBeam = ({ className }: { className?: string }) => (
  <div className={cn("pointer-events-none absolute inset-0 rounded-xl overflow-hidden", className)}>
    <div className="absolute inset-0 rounded-xl">
      <div
        className="absolute h-full w-full animate-[border-beam_4s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, transparent 70%, hsl(var(--primary)) 80%, transparent 100%)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "xor",
          WebkitMaskComposite: "xor",
          padding: "2px",
        }}
      />
    </div>
  </div>
);

// ─── Star rating component ───
const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <motion.button
        key={star}
        type="button"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(star)}
        className="focus:outline-none"
        aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
      >
        <Star
          className={cn(
            "h-8 w-8 transition-colors",
            star <= value
              ? "fill-secondary text-secondary"
              : "text-muted-foreground/30"
          )}
        />
      </motion.button>
    ))}
  </div>
);

// ─── Countdown display ───
const CountdownDisplay = ({
  label,
  seconds,
  variant,
}: {
  label: string;
  seconds: number;
  variant: "waiting" | "live" | "ending";
}) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const colorMap = {
    waiting: "text-primary",
    live: "text-emerald-400",
    ending: "text-secondary",
  };

  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1 font-mono">
        {hrs > 0 && (
          <>
            <span className={cn("text-3xl font-bold sm:text-4xl", colorMap[variant])}>
              {String(hrs).padStart(2, "0")}
            </span>
            <span className="text-xl text-muted-foreground">:</span>
          </>
        )}
        <span className={cn("text-3xl font-bold sm:text-4xl", colorMap[variant])}>
          {String(mins).padStart(2, "0")}
        </span>
        <span className="text-xl text-muted-foreground">:</span>
        <span className={cn("text-3xl font-bold sm:text-4xl", colorMap[variant])}>
          {String(secs).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ───
const SessionMeeting = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userType = useAuthStore((s) => s.user_type);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Support state
  const [showSupport, setShowSupport] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [sendingIssue, setSendingIssue] = useState(false);

  // Completed state
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSession(id).then((s) => {
      setSession(s);
      setLoading(false);
      if (s?.status === "completed") setCompleted(true);
    });
  }, [id]);

  // Live clock tick
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = useCallback(() => {
    if (!session?.meeting_link) return;
    navigator.clipboard.writeText(session.meeting_link);
    toast.success("Link copiado al portapapeles");
  }, [session?.meeting_link]);

  const handleComplete = async () => {
    if (!session || rating === 0) return;
    setSubmitting(true);
    try {
      await completeSession(session.id, rating, comment);
      toast.success("¡Sesión completada! Gracias por tu feedback. 🎉");
      setShowFeedback(false);
      setCompleted(true);
    } catch {
      toast.error("Error al completar la sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportIssue = async () => {
    if (!session || !issueType) return;
    setSendingIssue(true);
    try {
      await reportSessionIssue(session.id, issueType);
      toast.success("Reporte enviado. Nuestro equipo lo revisará.");
      setShowSupport(false);
      setIssueType("");
    } catch {
      toast.error("Error al enviar el reporte.");
    } finally {
      setSendingIssue(false);
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-2xl space-y-4 px-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
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
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ─── Time calculations ───
  const startTime = new Date(session.start_time);
  const endTime = new Date(startTime.getTime() + session.duration_minutes * 60_000);
  const enableTime = new Date(startTime.getTime() - 5 * 60_000); // 5 min before
  const threshold80 = new Date(
    startTime.getTime() + session.duration_minutes * 0.8 * 60_000
  );

  const secsUntilStart = Math.max(0, differenceInSeconds(startTime, now));
  const secsUntilEnd = Math.max(0, differenceInSeconds(endTime, now));
  const elapsed = differenceInSeconds(now, startTime);
  const totalDurationSecs = session.duration_minutes * 60;
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalDurationSecs) * 100));

  const isBeforeEnable = now < enableTime;
  const isBeforeStart = now < startTime;
  const isLive = now >= startTime && now < endTime;
  const isAfterEnd = now >= endTime;
  const canComplete = now >= threshold80 || isAfterEnd;
  const isConfirmed = session.status === "confirmed";

  const otherName = userType === "tutor" ? session.student_name : session.tutor_name;

  // ─── Completed screen ───
  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-400" />
          </motion.div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">
            ¡Sesión Completada!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gracias por usar SubjectSupport LATAM. Tu sesión de{" "}
            <span className="font-medium text-foreground">{session.subject}</span> con{" "}
            <span className="font-medium text-foreground">{otherName}</span> ha finalizado.
          </p>

          <Card className="mt-6 border-border/50 bg-card/80">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duración</span>
                <span className="text-foreground font-medium">{session.duration_minutes} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio acordado</span>
                <span className="font-medium text-emerald-400">
                  ${session.final_price ?? session.proposed_price}/h
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total pagado</span>
                <span className="font-bold text-foreground">${session.total_price.toFixed(2)} USD</span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              asChild
              className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <Link to={`/sessions/request/${session.tutor_id}`}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Agendar otra sesión
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                to={
                  userType === "tutor"
                    ? "/accounts/dashboard/tutor"
                    : "/accounts/dashboard/client"
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 px-4">
          <Link
            to={
              userType === "tutor"
                ? "/accounts/dashboard/tutor"
                : "/accounts/dashboard/client"
            }
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {session.subject}
            </p>
            <p className="truncate text-xs text-muted-foreground">con {otherName}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0",
              isLive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : isAfterEnd
                ? "border-muted text-muted-foreground"
                : "border-primary/30 bg-primary/10 text-primary"
            )}
          >
            {isLive ? "EN VIVO" : isAfterEnd ? "Finalizada" : "Próxima"}
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8 space-y-6">
        {/* Session info bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50 bg-card/80">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{session.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(startTime, "EEEE d MMM, HH:mm", { locale: es })} · {session.duration_minutes} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-lg font-bold text-emerald-400">
                  ${session.final_price ?? session.proposed_price}/h
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Countdown + Join area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <BorderBeam />
            <Card className="border-border/50 bg-card/80">
              <CardContent className="flex flex-col items-center gap-6 p-6 sm:p-8">
                {/* Countdown */}
                {isBeforeStart && (
                  <CountdownDisplay
                    label="La sesión comienza en"
                    seconds={secsUntilStart}
                    variant="waiting"
                  />
                )}
                {isLive && (
                  <>
                    <CountdownDisplay
                      label="Tiempo restante"
                      seconds={secsUntilEnd}
                      variant={secsUntilEnd < 300 ? "ending" : "live"}
                    />
                    {/* Progress bar */}
                    <div className="w-full max-w-xs">
                      <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            progressPct > 80 ? "bg-secondary" : "bg-emerald-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="mt-1 text-center text-[10px] text-muted-foreground">
                        {Math.round(progressPct)}% completada
                      </p>
                    </div>
                  </>
                )}
                {isAfterEnd && (
                  <div className="text-center">
                    <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      La sesión ha finalizado
                    </p>
                  </div>
                )}

                {/* Join button (Shiny) */}
                {isConfirmed && session.meeting_link && (
                  <div className="w-full max-w-sm space-y-3">
                    {isBeforeEnable ? (
                      <div className="rounded-lg border border-border/30 bg-muted/10 p-4 text-center">
                        <Sparkles className="mx-auto h-5 w-5 text-primary animate-pulse" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          La sala se habilitará <span className="font-medium text-foreground">5 minutos</span> antes del inicio
                        </p>
                      </div>
                    ) : (
                      <motion.a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-bold text-white shadow-xl transition-all overflow-hidden",
                          "bg-gradient-to-r from-primary to-primary/80",
                          "shadow-primary/30 hover:shadow-primary/50"
                        )}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 animate-[shimmer_2s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <Video className="relative h-6 w-6" />
                        <span className="relative">Unirse a la Clase</span>
                      </motion.a>
                    )}

                    {/* Copy link */}
                    {!isBeforeEnable && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleCopyLink}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copiar link de la reunión
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}

                {!session.meeting_link && isConfirmed && (
                  <div className="text-center rounded-lg border border-secondary/30 bg-secondary/10 p-4">
                    <AlertTriangle className="mx-auto h-5 w-5 text-secondary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      El link de reunión aún no ha sido configurado.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Complete session button — only after 80% elapsed */}
        {isConfirmed && canComplete && !completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div className="text-center">
                  <p className="font-semibold text-foreground">¿La sesión ha terminado?</p>
                  <p className="text-sm text-muted-foreground">
                    Marca como completada para dejar tu feedback
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowFeedback(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marcar como Completada
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Emergency support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card/80">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Soporte de Emergencia</p>
                  <p className="text-xs text-muted-foreground">
                    ¿Problemas técnicos con la conexión?
                  </p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSupport(true)}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                  Reportar
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Feedback Modal ─── */}
      <AlertDialog open={showFeedback} onOpenChange={setShowFeedback}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">
              ¿Cómo fue tu experiencia?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-5 pt-4">
                <div className="flex justify-center">
                  <StarRating value={rating} onChange={setRating} />
                </div>
                {rating > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-muted-foreground"
                  >
                    {rating <= 2
                      ? "Lamentamos escuchar eso 😔"
                      : rating <= 4
                      ? "¡Buena sesión! 👍"
                      : "¡Excelente! 🌟"}
                  </motion.p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="feedback-comment">Comentarios (opcional)</Label>
                  <Textarea
                    id="feedback-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos más sobre tu experiencia..."
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              disabled={rating === 0 || submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Enviando..." : "Completar Sesión"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Support Modal ─── */}
      <AlertDialog open={showSupport} onOpenChange={setShowSupport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-destructive" />
              Reportar Problema
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Selecciona el tipo de problema que estás experimentando.
                </p>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de problema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audio">No funciona el audio</SelectItem>
                    <SelectItem value="video">No funciona el video</SelectItem>
                    <SelectItem value="connection">Problemas de conexión</SelectItem>
                    <SelectItem value="link">El link no funciona</SelectItem>
                    <SelectItem value="tutor_absent">El tutor no se presenta</SelectItem>
                    <SelectItem value="student_absent">El estudiante no se presenta</SelectItem>
                    <SelectItem value="other">Otro problema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendingIssue}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportIssue}
              disabled={!issueType || sendingIssue}
              className="bg-destructive hover:bg-destructive/90"
            >
              {sendingIssue ? "Enviando..." : "Enviar Reporte"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SessionMeeting;
