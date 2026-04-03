import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Send,
  DollarSign,
  Sparkles,
  MessageCircle,
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
  sendCounterOffer,
  acceptOffer,
  rejectOffer,
  checkOverlap,
  CANCEL_REASONS,
  type Session,
  type NegotiationEntry,
} from "@/lib/mockSessions";
import { useAuthStore } from "@/stores/authStore";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-secondary/20 text-secondary border-secondary/30" },
  negotiating: { label: "En Negociación", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  confirmed: { label: "Confirmada", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Cancelada", color: "bg-destructive/20 text-destructive border-destructive/30" },
  completed: { label: "Completada", color: "bg-primary/20 text-primary border-primary/30" },
};

const NEGOTIATION_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Oferta Pendiente", color: "text-primary" },
  counter_offered: { label: "Contraoferta", color: "text-orange-400" },
  accepted: { label: "Trato Cerrado", color: "text-emerald-400" },
  rejected: { label: "Rechazada", color: "text-destructive" },
};

// ─── Confetti Animation ───
const Confetti = () => (
  <div className="pointer-events-none fixed inset-0 z-[100]">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-3 w-3 rounded-sm"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ["#3B82F6", "#EAB308", "#10B981", "#F97316", "#8B5CF6", "#EC4899"][i % 6],
        }}
        initial={{ top: "-5%", rotate: 0, opacity: 1 }}
        animate={{
          top: "105%",
          rotate: Math.random() * 720,
          opacity: 0,
          x: (Math.random() - 0.5) * 200,
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          delay: Math.random() * 0.5,
          ease: "easeOut",
        }}
      />
    ))}
  </div>
);

// ─── Chat Bubble ───
const ChatBubble = ({ entry, isOwn }: { entry: NegotiationEntry; isOwn: boolean }) => {
  const colorByType: Record<string, string> = {
    offer: "border-primary/30 bg-primary/10",
    counter_offer: "border-orange-500/30 bg-orange-500/10",
    accept: "border-emerald-500/30 bg-emerald-500/10",
    reject: "border-destructive/30 bg-destructive/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex", isOwn ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[80%] rounded-xl border p-3", colorByType[entry.type] ?? "border-border/50 bg-muted/20")}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{entry.sender_name}</span>
          {entry.type === "accept" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          {entry.type === "reject" && <XCircle className="h-3.5 w-3.5 text-destructive" />}
        </div>
        <p className="mt-1 text-sm text-foreground">{entry.message}</p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <Badge variant="outline" className={cn("text-xs font-bold", entry.type === "accept" ? "border-emerald-500/30 text-emerald-400" : entry.type === "counter_offer" ? "border-orange-500/30 text-orange-400" : "border-primary/30 text-primary")}>
            ${entry.amount}/h
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(entry.created_at), "d MMM, HH:mm", { locale: es })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───
const SessionConfirm = () => {
  const { id } = useParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile_data);
  const userType = useAuthStore((s) => s.user_type);

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

  // Negotiation state
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.negotiation_history.length]);

  const senderRole: "student" | "tutor" = userType === "tutor" ? "tutor" : "student";
  const senderName = profile?.full_name ?? "Usuario";

  const handleAcceptOffer = async () => {
    if (!session) return;
    setSendingOffer(true);
    try {
      const updated = await acceptOffer(session.id, senderRole, senderName);
      setSession(updated);
      setShowConfetti(true);
      toast.success("¡Trato cerrado! 🎉");
      setTimeout(() => setShowConfetti(false), 4000);
    } catch {
      toast.error("Error al aceptar la oferta.");
    } finally {
      setSendingOffer(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!session || !counterAmount) return;
    const amount = parseFloat(counterAmount);
    if (isNaN(amount) || amount <= 0) return;

    setSendingOffer(true);
    try {
      const updated = await sendCounterOffer(
        session.id,
        senderRole,
        senderName,
        amount,
        counterMessage || `Mi contraoferta es $${amount}/h.`
      );
      setSession(updated);
      setCounterAmount("");
      setCounterMessage("");
      toast.success("Contraoferta enviada.");
    } catch {
      toast.error("Error al enviar la contraoferta.");
    } finally {
      setSendingOffer(false);
    }
  };

  const handleReject = async () => {
    if (!session) return;
    setSendingOffer(true);
    try {
      const updated = await rejectOffer(session.id, senderRole, senderName, "No fue posible llegar a un acuerdo.");
      setSession(updated);
      toast.success("Negociación finalizada.");
    } catch {
      toast.error("Error.");
    } finally {
      setSendingOffer(false);
    }
  };

  const handleConfirm = async () => {
    if (!session) return;
    setConfirming(true);
    try {
      const needsLink = session.platform === "zoom" || session.platform === "custom";
      const updated = await confirmSession(session.id, needsLink ? meetingLink.trim() : session.meeting_link);
      setSession(updated);
      toast.success("Sesión confirmada exitosamente.");
    } catch {
      toast.error("Error al confirmar.");
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
        <div className="w-full max-w-3xl space-y-4 px-4">
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
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(session.start_time);
  const status = STATUS_MAP[session.status] ?? STATUS_MAP.pending;
  const negStatus = NEGOTIATION_MAP[session.negotiation_status] ?? NEGOTIATION_MAP.pending;
  const needsMeetingLink = session.platform === "zoom" || session.platform === "custom";
  const canConfirmSession = session.status === "pending" && session.negotiation_status === "accepted" && (!needsMeetingLink || meetingLink.trim().length > 0);
  const isNegotiating = session.status === "negotiating";
  const lastEntry = session.negotiation_history[session.negotiation_history.length - 1];
  const canRespond = isNegotiating && lastEntry?.sender !== senderRole;

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti />}

      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
          <Link to={userType === "tutor" ? "/accounts/dashboard/tutor" : "/accounts/dashboard/client"} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-lg font-bold text-foreground">Gestión de Sesión</h1>
          {isNegotiating && canRespond && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto"
            >
              <Badge className="animate-pulse bg-orange-500 text-white border-orange-500">
                <Sparkles className="mr-1 h-3 w-3" />
                Nueva {lastEntry?.type === "counter_offer" ? "Contraoferta" : "Oferta"}
              </Badge>
            </motion.div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Session Details */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Detalles</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className={status.color}>{status.label}</Badge>
                {session.negotiation_history.length > 0 && (
                  <Badge variant="outline" className={cn("border-border/50", negStatus.color)}>{negStatus.label}</Badge>
                )}
              </div>
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
                  <p className="font-medium text-foreground">{format(startDate, "EEEE d 'de' MMMM, HH:mm", { locale: es })}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Duración</p>
                  <p className="flex items-center gap-1 font-medium text-foreground"><Clock className="h-4 w-4 text-muted-foreground" /> {session.duration_minutes} min</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Plataforma</p>
                  <p className="flex items-center gap-1 font-medium text-foreground"><Video className="h-4 w-4 text-muted-foreground" /> {session.platform === "google_meet" ? "Google Meet" : session.platform === "zoom" ? "Zoom" : "Custom"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Precio</p>
                  <div className="flex items-baseline gap-2">
                    {session.final_price ? (
                      <p className="text-lg font-bold text-emerald-400">${session.final_price}/h</p>
                    ) : (
                      <p className="text-lg font-bold text-orange-400">${session.proposed_price}/h</p>
                    )}
                    {session.final_price && session.final_price !== session.hourly_rate && (
                      <p className="text-sm text-muted-foreground line-through">${session.hourly_rate}/h</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Total: ${session.total_price.toFixed(2)} USD</p>
                </div>
              </div>

              {session.meeting_link && session.status === "confirmed" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                    <p className="text-xs uppercase tracking-wider text-primary">Link de reunión</p>
                    <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline">
                      <LinkIcon className="h-3.5 w-3.5" />{session.meeting_link}
                    </a>
                  </div>
                  <Button asChild className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
                    <Link to={`/sessions/meeting/${session.id}`}>
                      <Video className="mr-2 h-4 w-4" /> Ir a la Sala de Reunión
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overlap Warning */}
          {overlap && (session.status === "pending" || session.status === "negotiating") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-lg border border-secondary/40 bg-secondary/10 p-4" role="alert">
              <AlertTriangle className="h-5 w-5 shrink-0 text-secondary" />
              <div>
                <p className="text-sm font-medium text-foreground">Conflicto de horario</p>
                <p className="text-xs text-muted-foreground">Tienes otra sesión ({overlap.subject}) el {format(new Date(overlap.start_time), "d MMM, HH:mm", { locale: es })}.</p>
              </div>
            </motion.div>
          )}

          {/* Negotiation Chat */}
          {session.negotiation_history.length > 0 && (
            <Card className="border-border/50 bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-orange-400" />
                  Negociación de Precio
                  {session.negotiation_status === "accepted" && (
                    <Badge className="ml-auto bg-emerald-600 text-white border-emerald-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Trato Cerrado
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  <AnimatePresence>
                    {session.negotiation_history.map((entry) => (
                      <ChatBubble key={entry.id} entry={entry} isOwn={entry.sender === senderRole} />
                    ))}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>

                {/* Deal closed animation */}
                {session.negotiation_status === "accepted" && session.final_price && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center"
                  >
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                    <p className="mt-2 text-lg font-bold text-foreground">¡Trato Hecho!</p>
                    <p className="text-sm text-muted-foreground">Precio acordado: <span className="font-bold text-emerald-400">${session.final_price}/h</span></p>
                    <p className="text-xs text-muted-foreground">Total: ${session.total_price.toFixed(2)} USD</p>
                  </motion.div>
                )}

                {/* Counter-offer form */}
                {canRespond && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-3 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {lastEntry?.sender === "student" ? `${lastEntry.sender_name} propone` : `${lastEntry?.sender_name} contraoferta`}:{" "}
                      <span className="font-bold text-orange-400">${lastEntry?.amount}/h</span>
                    </p>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAcceptOffer}
                        disabled={sendingOffer}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Aceptar ${lastEntry?.amount}/h
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={sendingOffer}
                        variant="outline"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        size="sm"
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>

                    <div className="border-t border-border/30 pt-3">
                      <p className="mb-2 text-xs text-muted-foreground">O envía una contraoferta:</p>
                      <div className="flex gap-2">
                        <div className="relative w-28 shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            placeholder="0.00"
                            className="pl-7"
                          />
                        </div>
                        <Input
                          value={counterMessage}
                          onChange={(e) => setCounterMessage(e.target.value)}
                          placeholder="Mensaje (opcional)"
                          className="flex-1"
                        />
                        <Button
                          onClick={handleCounterOffer}
                          disabled={!counterAmount || sendingOffer}
                          size="icon"
                          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Session confirmation (after negotiation accepted) */}
          {session.status === "pending" && session.negotiation_status === "accepted" && userType === "tutor" && (
            <Card className="border-border/50 bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg">Confirmar Sesión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {needsMeetingLink && (
                  <div className="space-y-2">
                    <Label htmlFor="meeting-link" className="flex items-center gap-1">
                      <LinkIcon className="h-3.5 w-3.5" /> Link de reunión <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="meeting-link"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder={session.platform === "zoom" ? "https://zoom.us/j/..." : "https://..."}
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <Button onClick={handleConfirm} disabled={!canConfirmSession || confirming} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {confirming ? "Confirmando..." : "Confirmar Sesión"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCancel(true)} className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10">
                    <XCircle className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Cancelar Sesión
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Esta acción no se puede deshacer.</strong>
                </p>
                <div className="space-y-2">
                  <Label>Motivo <span className="text-destructive">*</span></Label>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger>
                    <SelectContent>
                      {CANCEL_REASONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={!cancelReason || cancelling} className="bg-destructive hover:bg-destructive/90">
              {cancelling ? "Cancelando..." : "Sí, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SessionConfirm;
