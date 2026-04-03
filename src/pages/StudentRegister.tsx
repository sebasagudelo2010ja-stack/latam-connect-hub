import TubesHero from "@/components/TubesHero";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, ArrowLeft, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { studentSchema, type StudentFormData } from "@/lib/schemas";
import { useAuthStore } from "@/stores/authStore";
import { registerUser } from "@/lib/mockUserDb";
import { LATAM_COUNTRIES, COUNTRY_NAME_TO_CODE } from "@/lib/constants";
import { useGeoLocation } from "@/hooks/useGeoLocation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StudentRegister = () => {
  const { country } = useGeoLocation();
  const detectedCode = country ? COUNTRY_NAME_TO_CODE[country] ?? "" : "";
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
      is_minor: false,
      guardian_name: "",
      guardian_email: "",
      country: detectedCode,
    },
  });

  // Update country when geo detection completes
  const currentCountry = watch("country");
  if (detectedCode && !currentCountry) {
    setValue("country", detectedCode);
  }

  const isMinor = watch("is_minor");

  const onSubmit = async (data: StudentFormData) => {
    const profile = {
      id: crypto.randomUUID(),
      email: data.email,
      full_name: data.full_name,
      country: data.country,
      user_type: "client" as const,
      is_minor: data.is_minor,
      guardian_name: data.is_minor ? data.guardian_name : undefined,
      guardian_email: data.is_minor ? data.guardian_email : undefined,
    };

    const result = registerUser(data.email, data.password, profile);
    if (!result.success) {
      toast.error(result.error ?? "Error al registrar.");
      return;
    }

    login("mock-token-student", profile);
    toast.success("¡Registro exitoso! Ya puedes usar tu cuenta.");
    navigate("/accounts/dashboard/client");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden">
      <TubesHero />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
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
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Registro Estudiante</CardTitle>
            <CardDescription>Crea tu cuenta y comienza a aprender</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
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
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  placeholder="Juan Pérez"
                  autoComplete="name"
                  {...register("full_name")}
                  aria-invalid={!!errors.full_name}
                />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres y 1 número"
                  autoComplete="new-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  {...register("confirm_password")}
                  aria-invalid={!!errors.confirm_password}
                />
                {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password.message}</p>}
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <Label htmlFor="country">País</Label>
                <Select
                  value={watch("country")}
                  onValueChange={(v) => setValue("country", v, { shouldValidate: true })}
                >
                  <SelectTrigger id="country" aria-invalid={!!errors.country}>
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    {LATAM_COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
              </div>

              {/* Minor Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="is_minor"
                  checked={isMinor}
                  onCheckedChange={(checked) =>
                    setValue("is_minor", checked === true, { shouldValidate: true })
                  }
                />
                <Label htmlFor="is_minor" className="cursor-pointer text-sm font-normal">
                  Soy menor de edad
                </Label>
              </div>

              {/* Guardian fields (conditional) */}
              {isMinor && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-4"
                >
                  <p className="text-xs font-medium text-muted-foreground">Datos del Tutor Legal</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="guardian_name">Nombre del Tutor Legal</Label>
                    <Input
                      id="guardian_name"
                      placeholder="Nombre completo del tutor legal"
                      {...register("guardian_name")}
                      aria-invalid={!!errors.guardian_name}
                    />
                    {errors.guardian_name && <p className="text-sm text-destructive">{errors.guardian_name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="guardian_email">Email del Tutor Legal</Label>
                    <Input
                      id="guardian_email"
                      type="email"
                      placeholder="tutor@email.com"
                      {...register("guardian_email")}
                      aria-invalid={!!errors.guardian_email}
                    />
                    {errors.guardian_email && <p className="text-sm text-destructive">{errors.guardian_email.message}</p>}
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-azure text-azure-foreground shadow-lg shadow-azure/20 hover:bg-azure/90"
                size="lg"
              >
                {isSubmitting ? "Registrando..." : "Crear cuenta de Estudiante"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link to="/accounts/login/client" className="text-primary hover:underline">
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

export default StudentRegister;
