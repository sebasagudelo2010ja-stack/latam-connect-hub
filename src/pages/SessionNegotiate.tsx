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
  Clock,
  Video,
  Send,
  DollarSign,
  Sparkles,
  HandshakeIcon,
  AlertTriangle,
  User,
  GraduationCap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getSession,
  sendCounterOffer,
  acceptOffer,
  rejectOffer,
  type Session,
  type NegotiationEntry,
} from "@/lib/mockSessions";
import { useAuthStore } from "@/stores/authStore";

/* ─── Stepper step component ─── */
interface StepProps {
  entry: NegotiationEntry;
  index: number;
  isLast: boolean;
  total: number;
}

const NegotiationStep = ({ entry, index, isLast, total }: StepProps) => {
  const isTutor = entry.sender === "tutor";
  const colorMap: Record<string, { dot: string; line: string; bg: string; text: string }> = {
    offer: {
      dot: "bg-primary border-primary/50",
      line: "bg-primary/30",
      bg: "border-primary/20 bg-primary/5",
      text: "text-primary",
    },
    counter_offer: {
      dot: "bg-amber-500 border-amber-500/50",
      line: "bg-amber-500/30",
      bg: "border-amber-500/20 bg-amber-500/5",
      text: "text-amber-400",
    },
    accept: {
      dot: "bg-emerald-500 border-emerald-500/50",
      line: "bg-emerald-500/30",
      bg: "border-emerald-500/20 bg-emerald-500/5",
      text: "text-emerald-400",
    },
    reject: {
      dot: "bg-destructive border-destructive/50",
      line: "bg-destructive/30",
      bg: "border-destructive/20 bg-destructive/5",
      text: "text-destructive",
    },
  };
  const colors = colorMap[entry.type] ?? colorMap.offer;
  const Icon = isTutor ? GraduationCap : User;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex gap-4"
    >
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.05, type: "spring", stiffness: 300 }}
          className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2", colors.dot)}
        >
          <Icon className="h-4 w-4 text-white" />
        </motion.div>
        {!isLast && (
          <div className={cn("w-0.5 flex-1 min-h-[2rem]", colors.line)} />
        )}
      </div>

      {/* Content card */}
      <div className={cn("mb-4 flex-1 rounded-xl border p-4", colors.bg)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{entry.sender_name}</span>
            <Badge variant="outline" className={cn("text-[10px]", colors.text)}>
              {entry.type === "offer"
                ? "Oferta Inicial"
                : entry.type === "counter_offer"
                ? "Contraoferta"
                : entry.type === "accept"
                ? "Aceptado"
                : "Rechazado"}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(entry.created_at), "d MMM, HH:mm", { locale: es })}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{entry.message}</p>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-background/50 px-3 py-1.5 border border-border/30"
        >
          <DollarSign className={cn("h-4 w-4", colors.text)} />
          <span className={cn("text-lg font-bold", colors.text)}>{entry.amount}</span>
          <span className="text-xs text-muted-foreground">/hora</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ─── Confetti ─── */
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
        animate={{ top: "105%", rotate: Math.random() * 720, opacity: 0, x: (Math.random() - 0.5) * 200 }}
        transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: "easeOut" }}
      />
    ))}
  </div>
);

/* ─── Main ─── */
const SessionNegotiate = () => {
  const { id } = useParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile_data);
  const userType = useAuthStore((s) => s.user_type);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timelineEndRef = useRef<HTMLDivElement>(null);

  const senderRole: "student" | "tutor" = userType === "tutor" ? "tutor" : "student";
  const senderName = profile?.full_name ?? "Usuario";

  useEffect(() => {
    if (!id) return;
    getSession(id).then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.negotiation_history.length]);

  // ── Business rules ──
  // Tutor can only counter-offer once (MVP limit)
  const tutorCounterCount = session?.negotiation_history.filter(
    (e) => e.sender === "tutor" && e.type === "counter_offer"
  ).length ?? 0;
  const tutorCanCounter = senderRole === "tutor" && tutorCounterCount < 1;

  // After tutor counters, student can only accept or decline (no more counters)
  const studentCanCounter = false; // MVP: student cannot counter

  const lastEntry = session?.negotiation_history[session.negotiation_history.length - 1];
  const isNegotiating = session?.status === "negotiating";
  const canRespond = isNegotiating && lastEntry?.sender !== senderRole;
  const isFinalized = session?.negotiation_status === "accepted" || session?.negotiation_status === "rejected";

  // Django-ready JSON payload
  const djangoPayload = session
    ? {
        session_id: session.id,
        last_price_offered_by: lastEntry?.sender ?? null,
        current_negotiation_price: session.proposed_price,
        is_finalized: isFinalized,
        negotiation_status: session.negotiation_status,
        final_price: session.final_price,
      }
    : null;

  const handleAccept = async () => {
    if (!session) return;
    setSending(true);
    try {
      const updated = await acceptOffer(session.id, senderRole, senderName);
      setSession(updated);
      setShowConfetti(true);
      toast.success("¡Trato cerrado! 🎉");
      setTimeout(() => setShowConfetti(false), 4000);
    } catch {
      toast.error("Error al aceptar la oferta.");
    } finally {
      setSending(false);
    }
  };

  const handleCounter = async () => {
    if (!session || !counterAmount) return;
    const amount = parseFloat(counterAmount);
    if (isNaN(amount) || amount < 5 || amount > 100) {
      toast.error("El monto debe estar entre $5 y $100.");
      return;
    }
    setSending(true);
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
      setSending(false);
    }
  };

  const handleDecline = async () => {
    if (!session) return;
    setSending(true);
    try {
      const updated = await rejectOffer(session.id, senderRole, senderName, "No fue posible llegar a un acuerdo.");
      setSession(updated);
      toast("Negociación finalizada.", { description: "La solicitud ha sido cancelada." });
    } catch {
      toast.error("Error.");
    } finally {
      setSending(false);
    }
  };

  // ── Loading state ──
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
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(session.start_time);

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 px-4">
          <Link
            to={userType === "tutor" ? "/accounts/dashboard/tutor" : "/accounts/dashboard/client"}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-lg font-bold text-foreground">Negociación</h1>

          {/* Animated badge for pending action */}
          {canRespond && !isFinalized && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
              <Badge className="animate-pulse bg-amber-500 text-white border-amber-500">
                <Sparkles className="mr-1 h-3 w-3" />
                Tu turno
              </Badge>
            </motion.div>
          )}
          {isFinalized && session.negotiation_status === "accepted" && (
            <Badge className="ml-auto bg-emerald-600 text-white border-emerald-600">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Trato Cerrado
            </Badge>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8 space-y-6">
        {/* Session summary card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tutor</p>
                <p className="font-semibold text-foreground">{session.tutor_name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Materia</p>
                <p className="font-semibold text-foreground">{session.subject}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Fecha</p>
                <p className="flex items-center gap-1 font-semibold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {format(startDate, "d MMM, HH:mm", { locale: es })} · {session.duration_minutes} min
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Price comparison banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "flex items-center justify-between rounded-xl border p-4",
            isFinalized && session.negotiation_status === "accepted"
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-amber-500/30 bg-amber-500/5"
          )}
        >
          <div>
            <p className="text-xs text-muted-foreground">Tarifa original</p>
            <p className="text-lg font-bold text-foreground">${session.hourly_rate}/h</p>
          </div>
          <div className="text-center">
            <Video className={cn("mx-auto h-5 w-5", isFinalized ? "text-emerald-400" : "text-amber-400")} />
            <p className={cn("text-[10px] font-medium", isFinalized ? "text-emerald-400" : "text-amber-400")}>
              {isFinalized
                ? session.negotiation_status === "accepted"
                  ? "Acordado"
                  : "Rechazado"
                : "En negociación"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {session.final_price ? "Precio final" : "Última oferta"}
            </p>
            <p className={cn("text-lg font-bold", session.final_price ? "text-emerald-400" : "text-amber-400")}>
              ${session.final_price ?? session.proposed_price}/h
            </p>
          </div>
        </motion.div>

        {/* Negotiation Timeline (Stepper) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HandshakeIcon className="h-5 w-5 text-amber-400" />
                Historial de Negociación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[28rem] overflow-y-auto pr-1">
                <AnimatePresence>
                  {session.negotiation_history.map((entry, i) => (
                    <NegotiationStep
                      key={entry.id}
                      entry={entry}
                      index={i}
                      isLast={i === session.negotiation_history.length - 1}
                      total={session.negotiation_history.length}
                    />
                  ))}
                </AnimatePresence>
                <div ref={timelineEndRef} />
              </div>

              {/* Deal closed animation */}
              {session.negotiation_status === "accepted" && session.final_price && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                  </motion.div>
                  <p className="mt-3 text-xl font-bold text-foreground">¡Trato Hecho!</p>
                  <p className="mt-1 text-muted-foreground">
                    Precio acordado:{" "}
                    <span className="font-bold text-emerald-400">${session.final_price}/h</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: <span className="font-semibold text-foreground">${session.total_price.toFixed(2)} USD</span>
                  </p>
                  <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                    <Link to={`/sessions/confirm/${session.id}`}>
                      Ir a confirmar sesión →
                    </Link>
                  </Button>
                </motion.div>
              )}

              {session.negotiation_status === "rejected" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center"
                >
                  <XCircle className="mx-auto h-12 w-12 text-destructive" />
                  <p className="mt-3 text-xl font-bold text-foreground">Negociación Finalizada</p>
                  <p className="mt-1 text-sm text-muted-foreground">No se llegó a un acuerdo de precio.</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action panel — only if not finalized and it's your turn */}
        {canRespond && !isFinalized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  {senderRole === "tutor" ? "Responder a la oferta" : "Responder a la contraoferta"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Highlighted current offer */}
                <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-background/50 p-3">
                  <DollarSign className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {lastEntry?.sender_name} propone:
                    </p>
                    <p className="text-xl font-bold text-amber-400">${lastEntry?.amount}/h</p>
                  </div>
                </div>

                {/* Accept / Decline buttons */}
                <div className="flex gap-3">
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleAccept}
                      disabled={sending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Aceptar ${lastEntry?.amount}/h
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleDecline}
                      disabled={sending}
                      variant="outline"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </motion.div>
                </div>

                {/* Counter-offer form (tutor only, max 1 counter) */}
                {senderRole === "tutor" && tutorCanCounter && (
                  <div className="border-t border-border/30 pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      <p className="text-xs text-muted-foreground">
                        Solo puedes enviar <span className="font-semibold text-foreground">1 contraoferta</span> (MVP).
                      </p>
                    </div>
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
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleCounter}
                          disabled={!counterAmount || sending}
                          size="icon"
                          className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Student after tutor counter: can only accept or decline (shown above) */}
                {senderRole === "student" && lastEntry?.type === "counter_offer" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Puedes aceptar la contraoferta del tutor o rechazar la negociación.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Waiting state */}
        {isNegotiating && !canRespond && !isFinalized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent"
            />
            <p className="mt-3 text-sm font-medium text-foreground">Esperando respuesta...</p>
            <p className="text-xs text-muted-foreground">
              {senderRole === "tutor"
                ? "El estudiante revisará tu contraoferta."
                : "El tutor revisará tu oferta."}
            </p>
          </motion.div>
        )}

        {/* Debug: Django payload preview (hidden in production) */}
        {import.meta.env.DEV && djangoPayload && (
          <details className="rounded-lg border border-border/30 bg-muted/10 p-3">
            <summary className="cursor-pointer text-xs text-muted-foreground">Django Payload (dev)</summary>
            <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
              {JSON.stringify(djangoPayload, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default SessionNegotiate;
