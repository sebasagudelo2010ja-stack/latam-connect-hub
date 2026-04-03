import { GraduationCap } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/40 py-10" role="contentinfo">
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
      <div className="flex items-center gap-2 font-semibold text-foreground">
        <GraduationCap className="h-5 w-5 text-primary" />
        SubjectSupport LATAM
      </div>
      <p>© {new Date().getFullYear()} SubjectSupport LATAM. Todos los derechos reservados.</p>
    </div>
  </footer>
);

export default Footer;
