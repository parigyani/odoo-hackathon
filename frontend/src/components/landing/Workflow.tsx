import { motion } from "framer-motion";

export default function Workflow() {
  const steps = [
    { title: "Plan", desc: "Data optimization" },
    { title: "Dispatch", desc: "Automated routing" },
    { title: "Monitor", desc: "Live telemetry" },
    { title: "Analyze", desc: "Financial ROI" },
    { title: "Optimize", desc: "Continuous learning" }
  ];

  return (
    <section className="py-24 px-6 overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-display text-4xl font-semibold text-ink mb-4">A unified workflow</h2>
          <p className="text-ink/60 text-lg">From predictive planning to final analytics, every step of your fleet operation is connected.</p>
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0 max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-border/50 -z-10" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col items-center text-center relative group w-full md:w-auto"
            >
              <div className="w-12 h-12 rounded-full bg-canvas border-2 border-brand text-brand font-bold flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all shadow-lg">
                {i + 1}
              </div>
              <h4 className="font-display font-semibold text-ink mb-1">{step.title}</h4>
              <p className="text-xs text-ink/50 uppercase tracking-widest">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
