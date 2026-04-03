import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStudentDashboard, type StudentNotification } from "@/lib/mockApi";

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDashboard().then((d) => {
      setNotifications(d.notifications);
      setLoading(false);
    });
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("Todas las notificaciones marcadas como leídas.");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-foreground">Notificaciones</h2>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
                {unreadCount > 0 && (
                  <Button size="sm" variant="outline" onClick={markAllRead}>
                    <CheckCheck className="mr-2 h-4 w-4" /> Marcar todo como leído
                  </Button>
                )}
              </div>

              <Card className="border-border/50 bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
                  ) : notifications.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No tienes notificaciones</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
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
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentNotifications;
