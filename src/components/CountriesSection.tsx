import { motion } from "framer-motion";

const COUNTRIES = [
  { name: "México", flag: "🇲🇽" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "Perú", flag: "🇵🇪" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Guatemala", flag: "🇬🇹" },
  { name: "Cuba", flag: "🇨🇺" },
  { name: "Bolivia", flag: "🇧🇴" },
  { name: "Honduras", flag: "🇭🇳" },
  { name: "Paraguay", flag: "🇵🇾" },
  { name: "El Salvador", flag: "🇸🇻" },
  { name: "Nicaragua", flag: "🇳🇮" },
  { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Panamá", flag: "🇵🇦" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "Rep. Dominicana", flag: "🇩🇴" },
  { name: "Brasil", flag: "🇧🇷" },
  { name: "Puerto Rico", flag: "🇵🇷" },
];

const CountriesSection = () => {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="countries-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            Nuestra red de tutores cubre los 20 países de la región para que
            siempre encuentres ayuda cerca de ti.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {COUNTRIES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              whileHover={{ scale: 1.06 }}
              className="group flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="text-3xl" role="img" aria-label={`Bandera de ${c.name}`}>
                {c.flag}
              </span>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {c.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
