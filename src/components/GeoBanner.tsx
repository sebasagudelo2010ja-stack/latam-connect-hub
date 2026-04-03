import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin } from "lucide-react";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const GeoBanner = () => {
  const { country, isLatam, loading } = useGeoLocation();
  const [dismissed, setDismissed] = useState(false);

  if (loading || !isLatam || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-primary/30 bg-card/90 p-4 shadow-2xl shadow-primary/10 backdrop-blur-lg"
        role="status"
        aria-live="polite"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Cerrar banner"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            ¡Hola! Detectamos que estás en{" "}
            <span className="font-semibold text-primary">{country}</span>.
            Tenemos tutores disponibles para ti.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GeoBanner;
