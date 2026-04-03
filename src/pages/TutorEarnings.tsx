import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, CalendarDays, ArrowUpRight } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/TutorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface EarningEntry {
  id: string;
  student_name: string;
  subject: string;
  date: string;
  amount: number;
  duration_minutes: number;
  status: "paid" | "pending";
}

const MOCK_EARNINGS: EarningEntry[] = [
  { id: "e1", student_name: "Juan Pérez", subject: "Cálculo", date: "2026-04-01", amount: 25, duration_minutes: 60, status: "paid" },
  { id: "e2", student_name: "Sofía Martínez", subject: "Programación", date: "2026-03-28", amount: 45, duration_minutes: 90, status: "paid" },
  { id: "e3", student_name: "Diego Torres", subject: "Estadística", date: "2026-03-25", amount: 25, duration_minutes: 60, status: "paid" },
  { id: "e4", student_name: "Valentina Ruiz", subject: "Matemáticas", date: "2026-03-20", amount: 37.5, duration_minutes: 90, status: "paid" },
  { id: "e5", student_name: "Ana García", subject: "Física", date: "2026-04-05", amount: 30, duration_minutes: 60, status: "pending" },
  { id: "e6", student_name: "Carlos López", subject: "Química", date: "2026-04-07", amount: 50, duration_minutes: 120, status: "pending" },
];

const TutorEarnings = () => {
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    delay(800).then(() => {
      setEarnings(MOCK_EARNINGS);
      setLoading(false);
    });
  }, []);

  const totalEarned = earnings.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  const totalPending = earnings.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
  const totalSessions = earnings.filter((e) => e.status === "paid").length;

  const STATS = [
    { label: "Total Ganado", value: `$${totalEarned.toFixed(2)}`, icon: DollarSign, color: "text-emerald-400" },
    { label: "Pendiente de Pago", value: `$${totalPending.toFixed(2)}`, icon: TrendingUp, color: "text-amber-400" },
    { label: "Sesiones Pagadas", value: `${totalSessions}`, icon: CalendarDays, color: "text-primary" },
    { label: "Promedio por Sesión", value: totalSessions > 0 ? `$${(totalEarned / totalSessions).toFixed(2)}` : "$0", icon: ArrowUpRight, color: "text-secondary" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TutorSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-foreground">Ingresos</h2>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="mb-6 text-2xl font-bold text-foreground">Mis Ingresos</h1>

              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => (
                  <Card key={stat.label} className="border-border/50 bg-card/80">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold text-foreground">{stat.value}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-border/50 bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-secondary" /> Historial de Ingresos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
                  ) : (
                    <div className="space-y-3">
                      {earnings.map((entry) => (
                        <div key={entry.id} className="flex flex-col gap-2 rounded-lg border border-border/30 bg-muted/20 p-4 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{entry.student_name}</p>
                            <p className="text-sm text-muted-foreground">{entry.subject} · {entry.duration_minutes} min</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {new Date(entry.date).toLocaleDateString("es-LA", { day: "numeric", month: "short" })}
                            </Badge>
                            <Badge className={`text-xs ${entry.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                              {entry.status === "paid" ? "Pagado" : "Pendiente"}
                            </Badge>
                            <span className="text-lg font-bold text-foreground">${entry.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TutorEarnings;
