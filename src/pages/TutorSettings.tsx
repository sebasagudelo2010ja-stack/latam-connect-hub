import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/TutorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";

const AVAILABLE_SUBJECTS = [
  "Matemáticas", "Cálculo", "Álgebra", "Estadística", "Física", "Química",
  "Programación", "Inglés", "Historia", "Biología", "Economía", "Contabilidad",
];

const TutorSettings = () => {
  const { profile_data, updateProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile_data?.full_name ?? "");
  const [hourlyRate, setHourlyRate] = useState(String(profile_data?.hourly_rate ?? ""));
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(profile_data?.subjects ?? []);
  const [saving, setSaving] = useState(false);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleSave = async () => {
    const rate = parseFloat(hourlyRate);
    if (!fullName.trim()) return toast.error("El nombre es obligatorio.");
    if (isNaN(rate) || rate < 5 || rate > 100) return toast.error("La tarifa debe estar entre $5 y $100.");
    if (selectedSubjects.length === 0) return toast.error("Selecciona al menos una materia.");

    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateProfile({ full_name: fullName.trim(), hourly_rate: rate, subjects: selectedSubjects });
    toast.success("Configuración guardada exitosamente.");
    setSaving(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TutorSidebar />
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
                      <Settings className="h-5 w-5 text-secondary" /> Datos Personales
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
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/80">
                  <CardHeader>
                    <CardTitle>Tarifa por Hora</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label htmlFor="rate">Precio por hora (USD)</Label>
                    <Input id="rate" type="number" min={5} max={100} step={0.5} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="25" />
                    <p className="text-xs text-muted-foreground">Rango permitido: $5 – $100 USD.</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/80">
                  <CardHeader>
                    <CardTitle>Materias que Imparto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SUBJECTS.map((subject) => (
                        <Badge
                          key={subject}
                          variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${selectedSubjects.includes(subject) ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "hover:bg-muted"}`}
                          onClick={() => toggleSubject(subject)}
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {selectedSubjects.length} materia{selectedSubjects.length !== 1 ? "s" : ""} seleccionada{selectedSubjects.length !== 1 ? "s" : ""}
                    </p>
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

export default TutorSettings;
