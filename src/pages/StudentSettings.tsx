import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";

const StudentSettings = () => {
  const { profile_data, updateProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile_data?.full_name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) return toast.error("El nombre es obligatorio.");
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateProfile({ full_name: fullName.trim() });
    toast.success("Configuración guardada exitosamente.");
    setSaving(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-foreground">Configuración</h2>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="mb-6 text-2xl font-bold text-foreground">Configuración del Perfil</h1>
              <div className="max-w-2xl space-y-6">
                <Card className="border-border/50 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" /> Datos Personales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre completo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile_data?.email ?? ""} disabled className="opacity-60" />
                      <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
                    </div>
                    {profile_data?.country && (
                      <div className="space-y-2">
                        <Label>País</Label>
                        <Input value={profile_data.country} disabled className="opacity-60" />
                      </div>
                    )}
                    {profile_data?.is_minor && profile_data?.guardian_name && (
                      <div className="space-y-2">
                        <Label>Tutor Legal</Label>
                        <Input value={`${profile_data.guardian_name} (${profile_data.guardian_email})`} disabled className="opacity-60" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentSettings;
