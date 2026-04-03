import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Search,
  Bell,
  Sparkles,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import {
  fetchStudentDashboard,
  type StudentDashboardData,
  type StudentSession,
} from "@/lib/mockApi";

const STATUS_CONFIG: Record<StudentSession["status"], { label: string; color: string; icon: React.ElementType }> = {
  upcoming: { label: "Próxima", color: "bg-primary/20 text-primary", icon: CalendarDays },
  pending: { label: "Pendiente", color: "bg-secondary/20 text-secondary", icon: Clock },
  completed: { label: "Completada", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2 },
};

const StudentDashboard = () => {
  const { profile_data } = useAuthStore();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDashboard().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const firstName = profile_data?.full_name?.split(" ")[0] ?? "Estudiante";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* Greeting */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  ¡Hola, {firstName}! 👋
                </h1>
                <p className="mt-1 text-muted-foreground">Aquí tienes un resumen de tu actividad.</p>
              </div>

              {/* Bento Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Stats Cards */}
                <Card className="border-border/50 bg-card/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sesiones</CardTitle>
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{data?.total_sessions}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Próximas</CardTitle>
                    <Clock className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{data?.upcoming_count}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Shiny Search Button */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 sm:col-span-2 lg:col-span-1">
                  <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-8">
                    <div className="relative">
                      <div className="absolute -inset-1 animate-pulse rounded-full bg-primary/30 blur-md" />
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                        <Search className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <Button asChild className="bg-azure text-azure-foreground shadow-lg shadow-azure/20 hover:bg-azure/90">
                      <Link to="/tutors">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Buscar Tutor
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Sessions List */}
                <Card className="border-border/50 bg-card/80 sm:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      Mis Sesiones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data?.sessions.map((session) => {
                          const cfg = STATUS_CONFIG[session.status];
                          const Icon = cfg.icon;
                          const date = new Date(session.scheduled_at);
                          return (
                            <div
                              key={session.id}
                              className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                            >
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {session.subject} — {session.tutor_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {date.toLocaleDateString("es-LA", { day: "numeric", month: "short" })} · {session.duration_minutes} min
                                </p>
                              </div>
                              <Badge variant="outline" className={cfg.color}>
                                {cfg.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-border/50 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5 text-primary" />
                      Notificaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-1.5">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data?.notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`rounded-md border p-3 text-sm transition-colors ${
                              n.is_read
                                ? "border-border/30 bg-muted/10 text-muted-foreground"
                                : "border-primary/30 bg-primary/5 text-foreground"
                            }`}
                          >
                            <p>{n.message}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(n.created_at).toLocaleDateString("es-LA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
