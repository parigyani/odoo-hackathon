import { motion } from "framer-motion";

export default function Stats() {
  const stats = [
    { value: "10,000+", label: "Trips Managed", color: "text-ink" },
    { value: "98.7%", label: "Route Accuracy", color: "text-accent" },
    { value: "45%", label: "Reduced Downtime", color: "text-success" },
    { value: "30%", label: "Lower Fuel Costs", color: "text-brand-light dark:text-brand" }
  ];

  return (
    <section className="py-24 px-6 border-y border-border/50 bg-white/30 dark:bg-black/10 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x divide-border/50">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="px-4"
            >
              <h4 className={`text-4xl md:text-5xl font-display font-bold tracking-tight mb-2 ${stat.color}`}>
                {stat.value}
              </h4>
              <p className="text-ink/60 font-medium uppercase tracking-wider text-xs">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
