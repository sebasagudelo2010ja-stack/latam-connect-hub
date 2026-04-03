import { useState } from "react";
import { motion } from "framer-motion";

const COUNTRIES = [
  { name: "México", flag: "🇲🇽", code: "MX" },
  { name: "Colombia", flag: "🇨🇴", code: "CO" },
  { name: "Argentina", flag: "🇦🇷", code: "AR" },
  { name: "Chile", flag: "🇨🇱", code: "CL" },
  { name: "Perú", flag: "🇵🇪", code: "PE" },
  { name: "Ecuador", flag: "🇪🇨", code: "EC" },
  { name: "Venezuela", flag: "🇻🇪", code: "VE" },
  { name: "Guatemala", flag: "🇬🇹", code: "GT" },
  { name: "Cuba", flag: "🇨🇺", code: "CU" },
  { name: "Bolivia", flag: "🇧🇴", code: "BO" },
  { name: "Honduras", flag: "🇭🇳", code: "HN" },
  { name: "Paraguay", flag: "🇵🇾", code: "PY" },
  { name: "El Salvador", flag: "🇸🇻", code: "SV" },
  { name: "Nicaragua", flag: "🇳🇮", code: "NI" },
  { name: "Costa Rica", flag: "🇨🇷", code: "CR" },
  { name: "Panamá", flag: "🇵🇦", code: "PA" },
  { name: "Uruguay", flag: "🇺🇾", code: "UY" },
  { name: "Rep. Dominicana", flag: "🇩🇴", code: "DO" },
  { name: "Brasil", flag: "🇧🇷", code: "BR" },
  { name: "Puerto Rico", flag: "🇵🇷", code: "PR" },
];

const FlipCard = ({ country, index }: { country: typeof COUNTRIES[number]; index: number }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group perspective-[600px]"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onFocus={() => setFlipped(true)}
      onBlur={() => setFlipped(false)}
      tabIndex={0}
      role="button"
      aria-label={`${country.name} ${country.flag}`}
    >
      <div
        className="relative h-16 w-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — country name */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full border border-border/30 bg-muted/10 px-4"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {country.name}
          </span>
        </div>

        {/* Back — flag */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-4"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="text-3xl" role="img" aria-label={`Bandera de ${country.name}`}>
            {country.flag}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const CountriesSection = () => {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="countries-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2
            id="countries-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Presentes en toda{" "}
            <span className="text-primary">Latinoamérica</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Nuestra red de tutores cubre los 20 países de la región. Pasa el
            cursor sobre cada país para descubrir su bandera.
          </p>
        </motion.div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {COUNTRIES.map((c, i) => (
            <div key={c.code} className="w-[calc(50%-0.375rem)] sm:w-[calc(25%-0.75rem)] md:w-[calc(20%-0.75rem)]">
              <FlipCard country={c} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
