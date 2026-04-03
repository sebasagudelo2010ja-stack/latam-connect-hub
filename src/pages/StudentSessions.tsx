import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ExternalLink } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchStudentDashboard, type StudentSession } from "@/lib/mockApi";

const STATUS_LABELS: Record<StudentSession["status"], string> = {
  upcoming: "Próxima", pending: "Pendiente", completed: "Completada",
};
const STATUS_COLORS: Record<StudentSession["status"], string> = {
  upcoming: "bg-primary/20 text-primary", pending: "bg-amber-500/20 text-amber-400", completed: "bg-emerald-500/20 text-emerald-400",
};

const StudentSessions = () => {
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDashboard().then((d) => {
      setSessions(d.sessions);
      setLoading(false);
    });
  }, []);

  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const pending = sessions.filter((s) => s.status === "pending");
  const completed = sessions.filter((s) => s.status === "completed");

  const SessionCard = ({ session }: { session: StudentSession }) => (
    <div className="flex flex-col gap-3 rounded-lg border border-border/30 bg-muted/20 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{session.tutor_name}</p>
        <p className="text-sm text-muted-foreground">{session.subject} · {session.duration_minutes} min</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {new Date(session.scheduled_at).toLocaleDateString("es-LA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </Badge>
          <Badge className={`text-xs ${STATUS_COLORS[session.status]}`}>{STATUS_LABELS[session.status]}</Badge>
        </div>
      </div>
      {session.status === "upcoming" && (
        <Button size="sm" variant="outline" asChild>
          <a href={`/sessions/meeting/${session.id}`}>
            <ExternalLink className="mr-1 h-4 w-4" /> Ver Sesión
          </a>
        </Button>
      )}
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-foreground">Mis Sesiones</h2>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="mb-6 text-2xl font-bold text-foreground">Mis Sesiones</h1>
              {loading ? (
                <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
              ) : (
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pendientes ({pending.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completadas ({completed.length})</TabsTrigger>
                  </TabsList>
                  {(["upcoming", "pending", "completed"] as const).map((tab) => {
                    const list = tab === "upcoming" ? upcoming : tab === "pending" ? pending : completed;
                    return (
                      <TabsContent key={tab} value={tab}>
                        <Card className="border-border/50 bg-card/80">
                          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> {STATUS_LABELS[tab]}</CardTitle></CardHeader>
                          <CardContent className="space-y-3">
                            {list.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No hay sesiones en esta categoría</p> : list.map((s) => <SessionCard key={s.id} session={s} />)}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentSessions;
