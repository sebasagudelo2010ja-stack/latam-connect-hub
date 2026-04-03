import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ExternalLink } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/TutorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Session, type SessionStatus } from "@/lib/mockSessions";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_TUTOR_SESSIONS: Session[] = [
  {
    id: "ts1", tutor_id: "t1", student_id: "s1", tutor_name: "Yo", student_name: "Juan Pérez",
    subject: "Cálculo", start_time: "2026-04-07T15:00:00Z", duration_minutes: 60,
    platform: "google_meet", meeting_link: "https://meet.google.com/abc-defg-hij",
    hourly_rate: 25, proposed_price: 25, final_price: 25, total_price: 25,
    status: "confirmed", negotiation_status: "accepted", negotiation_history: [],
    cancel_reason: null, created_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "ts2", tutor_id: "t1", student_id: "s2", tutor_name: "Yo", student_name: "Sofía Martínez",
    subject: "Programación", start_time: "2026-04-08T10:00:00Z", duration_minutes: 90,
    platform: "zoom", meeting_link: "https://zoom.us/j/123456",
    hourly_rate: 30, proposed_price: 28, final_price: 30, total_price: 45,
    status: "confirmed", negotiation_status: "accepted", negotiation_history: [],
    cancel_reason: null, created_at: "2026-04-02T09:00:00Z",
  },
  {
    id: "ts3", tutor_id: "t1", student_id: "s3", tutor_name: "Yo", student_name: "Diego Torres",
    subject: "Estadística", start_time: "2026-03-25T13:00:00Z", duration_minutes: 60,
    platform: "google_meet", meeting_link: null,
    hourly_rate: 25, proposed_price: 25, final_price: 25, total_price: 25,
    status: "completed", negotiation_status: "accepted", negotiation_history: [],
    cancel_reason: null, created_at: "2026-03-20T10:00:00Z",
  },
  {
    id: "ts4", tutor_id: "t1", student_id: "s4", tutor_name: "Yo", student_name: "Valentina Ruiz",
    subject: "Matemáticas", start_time: "2026-03-20T11:00:00Z", duration_minutes: 45,
    platform: "zoom", meeting_link: null,
    hourly_rate: 25, proposed_price: 20, final_price: null, total_price: 15,
    status: "cancelled", negotiation_status: "rejected", negotiation_history: [],
    cancel_reason: "Conflicto de horario", created_at: "2026-03-15T10:00:00Z",
  },
];

const STATUS_LABELS: Record<SessionStatus, string> = {
  pending: "Pendiente", negotiating: "Negociando", confirmed: "Confirmada", cancelled: "Cancelada", completed: "Completada",
};

const STATUS_COLORS: Record<SessionStatus, string> = {
  pending: "bg-amber-500/20 text-amber-400", negotiating: "bg-orange-500/20 text-orange-400",
  confirmed: "bg-emerald-500/20 text-emerald-400", cancelled: "bg-destructive/20 text-destructive",
  completed: "bg-primary/20 text-primary",
};

const TutorSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    delay(800).then(() => {
      setSessions(MOCK_TUTOR_SESSIONS);
      setLoading(false);
    });
  }, []);

  const upcoming = sessions.filter((s) => s.status === "confirmed");
  const completed = sessions.filter((s) => s.status === "completed");
  const cancelled = sessions.filter((s) => s.status === "cancelled");

  const SessionCard = ({ session }: { session: Session }) => (
    <div className="flex flex-col gap-3 rounded-lg border border-border/30 bg-muted/20 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{session.student_name}</p>
        <p className="text-sm text-muted-foreground">{session.subject} · {session.duration_minutes} min</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {new Date(session.start_time).toLocaleDateString("es-LA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </Badge>
          <Badge className={`text-xs ${STATUS_COLORS[session.status]}`}>{STATUS_LABELS[session.status]}</Badge>
          <Badge variant="outline" className="text-xs">${session.final_price ?? session.proposed_price}/h</Badge>
        </div>
      </div>
      {session.status === "confirmed" && session.meeting_link && (
        <Button size="sm" variant="outline" asChild>
          <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1 h-4 w-4" /> Unirse
          </a>
        </Button>
      )}
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TutorSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-foreground">Mis Sesiones</h2>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="mb-6 text-2xl font-bold text-foreground">Mis Sesiones</h1>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
                </div>
              ) : (
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completadas ({completed.length})</TabsTrigger>
                    <TabsTrigger value="cancelled">Canceladas ({cancelled.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    <Card className="border-border/50 bg-card/80">
                      <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-secondary" /> Próximas Sesiones</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {upcoming.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No tienes sesiones próximas</p> : upcoming.map((s) => <SessionCard key={s.id} session={s} />)}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="completed">
                    <Card className="border-border/50 bg-card/80">
                      <CardHeader><CardTitle>Sesiones Completadas</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {completed.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No tienes sesiones completadas</p> : completed.map((s) => <SessionCard key={s.id} session={s} />)}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="cancelled">
                    <Card className="border-border/50 bg-card/80">
                      <CardHeader><CardTitle>Sesiones Canceladas</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {cancelled.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No hay sesiones canceladas</p> : cancelled.map((s) => <SessionCard key={s.id} session={s} />)}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TutorSessions;
