import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { is_authenticated, user_type, profile_data, logout } = useAuthStore();

  const dashboardPath =
    user_type === "tutor"
      ? "/accounts/dashboard/tutor"
      : "/accounts/dashboard/client";

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground" aria-label="SubjectSupport LATAM — Inicio">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>SubjectSupport <span className="text-primary">LATAM</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {is_authenticated ? (
            <>
              <Button asChild variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10">
                <Link to={dashboardPath}>
                  Mi Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10">
                    Iniciar sesión
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link to="/accounts/register/client">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Login Estudiante
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link to="/tutores/registro">
                      <GraduationCap className="h-4 w-4 text-secondary" />
                      Login Tutor
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-2 px-4 py-4">
            {is_authenticated ? (
              <>
                <Button asChild variant="outline" className="w-full justify-start gap-2 border-primary/30">
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>
                    Mi Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full justify-start gap-2 border-primary/30">
                  <Link to="/accounts/register/client" onClick={() => setMobileOpen(false)}>
                    <BookOpen className="h-4 w-4 text-primary" />
                    Login Estudiante
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2 border-secondary/30">
                  <Link to="/tutores/registro" onClick={() => setMobileOpen(false)}>
                    <GraduationCap className="h-4 w-4 text-secondary" />
                    Login Tutor
                  </Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
