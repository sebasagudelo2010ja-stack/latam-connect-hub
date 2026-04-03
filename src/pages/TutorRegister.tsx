import TubesHero from "@/components/TubesHero";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap, AlertTriangle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { tutorSchema, type TutorFormData } from "@/lib/schemas";
import { useAuthStore } from "@/stores/authStore";
import { registerUser } from "@/lib/mockUserDb";
import { SUBJECTS } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TutorRegister = () => {
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TutorFormData>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      subjects: [],
      hourly_rate: "",
    },
  });

  const selectedSubjects = watch("subjects");
  const hourlyRate = watch("hourly_rate");
  const rateNum = parseFloat(hourlyRate || "0");
  const showRateWarning = hourlyRate && !isNaN(rateNum) && rateNum > 0 && (rateNum < 5 || rateNum > 100);

  const toggleSubject = (subject: string) => {
    const current = selectedSubjects ?? [];
    if (current.includes(subject)) {
      setValue("subjects", current.filter((s) => s !== subject), { shouldValidate: true });
    } else if (current.length < 5) {
      setValue("subjects", [...current, subject], { shouldValidate: true });
    }
  };

  const removeSubject = (subject: string) => {
    setValue("subjects", (selectedSubjects ?? []).filter((s) => s !== subject), { shouldValidate: true });
  };

  const onSubmit = async (data: TutorFormData) => {
    const profile = {
      id: crypto.randomUUID(),
      email: data.email,
      full_name: data.full_name,
      user_type: "tutor" as const,
      subjects: data.subjects,
      hourly_rate: parseFloat(data.hourly_rate),
    };

    const result = registerUser(data.email, data.password, profile);
    if (!result.success) {
      toast.error(result.error ?? "Error al registrar.");
      return;
    }

    login("mock-token-tutor", profile);
    toast.success("¡Registro exitoso! Ya puedes usar tu cuenta.");
    navigate("/accounts/dashboard/tutor");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground self-start"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
              <GraduationCap className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-2xl">Registro Tutor</CardTitle>
            <CardDescription>Únete a nuestra red de tutores en LATAM</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="tutor-email">Email</Label>
                <Input
                  id="tutor-email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="tutor-name">Nombre Completo</Label>
                <Input
                  id="tutor-name"
                  placeholder="María González"
                  autoComplete="name"
                  {...register("full_name")}
                  aria-invalid={!!errors.full_name}
                />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="tutor-password">Contraseña</Label>
                <Input
                  id="tutor-password"
                  type="password"
                  placeholder="Mínimo 8 caracteres y 1 número"
                  autoComplete="new-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              {/* Subjects Multi-select */}
              <div className="space-y-1.5">
                <Label>Materias ({selectedSubjects?.length ?? 0}/5)</Label>
                <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start font-normal"
                      aria-invalid={!!errors.subjects}
                    >
                      {selectedSubjects?.length
                        ? `${selectedSubjects.length} materia(s) seleccionada(s)`
                        : "Buscar y seleccionar materias..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar materia..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron materias.</CommandEmpty>
                        <CommandGroup>
                          {SUBJECTS.map((s) => (
                            <CommandItem
                              key={s}
                              value={s}
                              onSelect={() => toggleSubject(s)}
                              className="cursor-pointer"
                            >
                              <span
                                className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                                  selectedSubjects?.includes(s)
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {selectedSubjects?.includes(s) && "✓"}
                              </span>
                              {s}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedSubjects && selectedSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedSubjects.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSubject(s)}
                          aria-label={`Quitar ${s}`}
                          className="hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.subjects && <p className="text-sm text-destructive">{errors.subjects.message}</p>}
              </div>

              {/* Hourly Rate */}
              <div className="space-y-1.5">
                <Label htmlFor="hourly_rate">Tarifa por hora (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    id="hourly_rate"
                    type="text"
                    inputMode="decimal"
                    placeholder="25.00"
                    className="pl-7"
                    {...register("hourly_rate")}
                    aria-invalid={!!errors.hourly_rate}
                  />
                </div>
                {errors.hourly_rate && <p className="text-sm text-destructive">{errors.hourly_rate.message}</p>}
                {showRateWarning && (
                  <p className="flex items-center gap-1 text-sm text-secondary">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    El rango recomendado es entre $5 y $100 USD
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
                size="lg"
              >
                {isSubmitting ? "Registrando..." : "Crear cuenta de Tutor"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link to="/accounts/login/tutor" className="text-secondary hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TutorRegister;
