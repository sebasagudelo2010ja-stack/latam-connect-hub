import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowLeft,
  Star,
  MapPin,
  CalendarIcon,
  Clock,
  Video,
  Monitor,
  LinkIcon,
  DollarSign,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

import { MOCK_TUTORS } from "@/lib/mockTutors";
import { createSession, type Platform } from "@/lib/mockSessions";
import { useAuthStore } from "@/stores/authStore";

const DURATIONS = [60, 90, 120, 150, 180];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7-20

const PLATFORM_OPTIONS: { value: Platform; label: string; icon: React.ElementType }[] = [
  { value: "google_meet", label: "Google Meet", icon: Video },
  { value: "zoom", label: "Zoom", icon: Monitor },
  { value: "custom", label: "Link Personalizado", icon: LinkIcon },
];

const SessionRequest = () => {
  const { tutor_id } = useParams<{ tutor_id: string }>();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile_data);

  const tutor = MOCK_TUTORS.find((t) => t.id === tutor_id);

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState<Date>();
  const [hour, setHour] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [platform, setPlatform] = useState<Platform>("google_meet");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = useMemo(() => {
    if (!tutor) return 0;
    return (tutor.hourly_rate * duration) / 60;
  }, [tutor, duration]);

  const startTimeISO = useMemo(() => {
    if (!date || !hour) return null;
    const d = new Date(date);
    d.setHours(parseInt(hour, 10), 0, 0, 0);
    return d.toISOString();
  }, [date, hour]);

  const isFormValid = subject && date && hour && duration && platform;

  const handleSubmit = async () => {
    if (!tutor || !startTimeISO || !profile) return;
    setSubmitting(true);
    try {
      await createSession({
        tutor_id: tutor.id,
        student_id: profile.id,
        tutor_name: tutor.full_name,
        student_name: profile.full_name,
        subject,
        start_time: startTimeISO,
        duration_minutes: duration,
        platform,
        hourly_rate: tutor.hourly_rate,
      });
      toast.success("¡Solicitud enviada! El tutor confirmará tu sesión pronto.");
      navigate("/accounts/dashboard/client");
    } catch {
      toast.error("Error al crear la solicitud. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (!tutor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Tutor no encontrado</h2>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/tutors">Volver a la búsqueda</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to="/tutors" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Tutores</span>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Solicitar Sesión</h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Tutor Info Card — Sticky on desktop */}
          <aside className="lg:w-80 lg:shrink-0">
            <div className="lg:sticky lg:top-20">
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={tutor.photo_url}
                      alt={tutor.full_name}
                      className="h-16 w-16 rounded-full border-2 border-border/50 bg-muted"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{tutor.full_name}</h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {tutor.country}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                        <span className="text-sm font-medium">{tutor.rating_avg}</span>
                        <span className="text-xs text-muted-foreground">({tutor.total_reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tutor.subjects.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>

                  <div className="mt-4 rounded-lg border border-border/30 bg-muted/20 p-3 text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Tarifa</p>
                    <p className="text-2xl font-bold text-foreground">${tutor.hourly_rate}</p>
                    <p className="text-xs text-muted-foreground">USD / hora</p>
                  </div>

                  {/* Dynamic Total */}
                  <motion.div
                    key={totalPrice}
                    initial={{ scale: 0.95, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-center"
                  >
                    <p className="text-xs uppercase tracking-wider text-primary">Total a pagar</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${totalPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{duration} min de sesión</p>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0 flex-1"
          >
            <Card className="border-border/50 bg-card/80">
              <CardHeader>
                <CardTitle className="text-xl">Detalles de la Sesión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject */}
                <div className="space-y-2">
                  <Label>Materia</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutor.subjects.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date + Time row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: es }) : "Selecciona fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label>Hora (24h)</Label>
                    <Select value={hour} onValueChange={setHour}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((h) => (
                          <SelectItem key={h} value={String(h)}>
                            {String(h).padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Duración</Label>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map((d) => (
                      <Button
                        key={d}
                        type="button"
                        variant={duration === d ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDuration(d)}
                        className={duration === d ? "bg-primary text-primary-foreground" : ""}
                      >
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        {d} min
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {PLATFORM_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = platform === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPlatform(opt.value)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border p-3 text-sm transition-all",
                            selected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", selected && "text-primary")} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!isFormValid}
                  className="w-full bg-azure text-azure-foreground shadow-lg shadow-azure/20 hover:bg-azure/90"
                  size="lg"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Solicitar Sesión — ${totalPrice.toFixed(2)} USD
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Solicitud</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Tutor:</span> <span className="font-medium text-foreground">{tutor.full_name}</span></p>
                  <p><span className="text-muted-foreground">Materia:</span> <span className="font-medium text-foreground">{subject}</span></p>
                  <p>
                    <span className="text-muted-foreground">Fecha:</span>{" "}
                    <span className="font-medium text-foreground">
                      {date ? format(date, "EEEE, d 'de' MMMM yyyy", { locale: es }) : ""}
                    </span>
                  </p>
                  <p><span className="text-muted-foreground">Hora:</span> <span className="font-medium text-foreground">{hour ? `${hour.padStart(2, "0")}:00` : ""}</span></p>
                  <p><span className="text-muted-foreground">Duración:</span> <span className="font-medium text-foreground">{duration} minutos</span></p>
                  <p><span className="text-muted-foreground">Plataforma:</span> <span className="font-medium text-foreground">{PLATFORM_OPTIONS.find((p) => p.value === platform)?.label}</span></p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-center">
                  <p className="text-xs uppercase tracking-wider text-primary">Total a pagar</p>
                  <p className="text-2xl font-bold text-foreground">${totalPrice.toFixed(2)} USD</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-azure hover:bg-azure/90 text-azure-foreground"
            >
              {submitting ? "Enviando..." : "Confirmar Solicitud"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SessionRequest;
