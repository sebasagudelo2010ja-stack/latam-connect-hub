import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";
import { loginUser } from "@/lib/mockUserDb";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type LoginFormData = z.infer<typeof loginSchema>;

const TutorLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = loginUser(data.email, data.password, "tutor");
    if (!result.success || !result.profile) {
      setError("root", { message: result.error ?? "Error al iniciar sesión." });
      return;
    }
    login("mock-token-tutor", result.profile);
    toast.success(`¡Bienvenido, ${result.profile.full_name}!`);
    navigate("/accounts/dashboard/tutor");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground self-start"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
              <GraduationCap className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Accede a tu cuenta de tutor</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {errors.root.message}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="tutor-login-email">Email</Label>
                <Input
                  id="tutor-login-email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tutor-login-password">Contraseña</Label>
                <Input
                  id="tutor-login-password"
                  type="password"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
                size="lg"
              >
                {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
              </Button>

              <div className="space-y-2 pt-2 text-center text-sm text-muted-foreground">
                <p>
                  ¿No tienes cuenta?{" "}
                  <Link to="/tutores/registro" className="text-secondary hover:underline">
                    Regístrate como tutor
                  </Link>
                </p>
                <p>
                  ¿Eres estudiante?{" "}
                  <Link to="/accounts/login/client" className="text-primary hover:underline">
                    Login Estudiante
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TutorLogin;
