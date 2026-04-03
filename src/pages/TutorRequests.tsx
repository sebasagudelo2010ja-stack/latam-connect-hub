import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/TutorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fetchTutorDashboard, respondToRequest, type TutorRequest } from "@/lib/mockApi";

const TutorRequests = () => {
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ open: boolean; action: "accept" | "reject"; request: TutorRequest | null }>({ open: false, action: "accept", request: null });
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchTutorDashboard().then((d) => {
      setRequests(d.pending_requests);
      setLoading(false);
    });
  }, []);

  const handleAction = (request: TutorRequest, action: "accept" | "reject") => {
    setConfirm({ open: true, action, request });
  };

  const confirmAction = async () => {
    if (!confirm.request) return;
    setResponding(true);
    await respondToRequest(confirm.request.id, confirm.action);
    setRequests((prev) => prev.filter((r) => r.id !== confirm.request!.id));
    toast.success(
      confirm.action === "accept"
        ? `Sesión con ${confirm.request.student_name} aceptada`
        : `Solicitud de ${confirm.request.student_name} rechazada`
    );
    setResponding(false);
    setConfirm({ open: false, action: "accept", request: null });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TutorSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-foreground">Solicitudes</h2>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="mb-6 text-2xl font-bold text-foreground">Solicitudes Pendientes</h1>

              <Card className="border-border/50 bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-secondary" />
                    Solicitudes por Confirmar ({requests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : requests.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No tienes solicitudes pendientes 🎉</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((req) => {
                        const proposedDate = new Date(req.proposed_time);
                        return (
                          <div key={req.id} className="flex flex-col gap-3 rounded-lg border border-border/30 bg-muted/20 p-4 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground">{req.student_name}</p>
                              <p className="text-sm text-muted-foreground">{req.subject} · {req.duration_minutes} min</p>
                              <div className="mt-1 flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {proposedDate.toLocaleDateString("es-LA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{req.student_country}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAction(req, "accept")} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                <CheckCircle2 className="mr-1 h-4 w-4" /> Aceptar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAction(req, "reject")} className="border-destructive/50 text-destructive hover:bg-destructive/10">
                                <XCircle className="mr-1 h-4 w-4" /> Rechazar
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>

      <AlertDialog open={confirm.open} onOpenChange={(open) => !open && setConfirm({ ...confirm, open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.action === "accept" ? "¿Aceptar solicitud?" : "¿Rechazar solicitud?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm.action === "accept"
                ? `Confirmarás la sesión de ${confirm.request?.subject} con ${confirm.request?.student_name}.`
                : `Rechazarás la solicitud de ${confirm.request?.student_name}. Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={responding}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={responding}
              className={confirm.action === "accept" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"}>
              {responding ? "Procesando..." : confirm.action === "accept" ? "Sí, aceptar" : "Sí, rechazar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default TutorRequests;
