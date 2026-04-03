import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground" aria-label="SubjectSupport LATAM — Inicio">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>SubjectSupport <span className="text-primary">LATAM</span></span>
        </a>

        {/* Desktop */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10">
                Iniciar sesión
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Login Estudiante
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <GraduationCap className="h-4 w-4 text-secondary" />
                Login Tutor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <Button variant="outline" className="w-full justify-start gap-2 border-primary/30">
              <BookOpen className="h-4 w-4 text-primary" />
              Login Estudiante
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 border-secondary/30">
              <GraduationCap className="h-4 w-4 text-secondary" />
              Login Tutor
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
