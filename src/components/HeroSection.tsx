import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RetroGrid from "./RetroGrid";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const HeroSection = () => {
  return (
    <section
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16"
      aria-labelledby="hero-heading"
    >
      <RetroGrid />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6"
      >
        <motion.h1
          id="hero-heading"
          variants={item}
          className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Conecta con tutores de toda{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Latinoamérica
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Encuentra al tutor perfecto para cualquier materia. Clases personalizadas,
          horarios flexibles y la mejor calidad educativa de la región.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="w-full bg-azure text-azure-foreground shadow-lg shadow-azure/25 hover:bg-azure/90 sm:w-auto"
          >
            Soy Estudiante
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            className="w-full bg-gold text-gold-foreground shadow-lg shadow-gold/25 hover:bg-gold/90 sm:w-auto"
          >
            Soy Tutor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
