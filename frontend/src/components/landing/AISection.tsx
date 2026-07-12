import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, ShieldAlert, Zap, Navigation } from "lucide-react";

export default function AISection() {
  const insights = [
    { title: "Route Suggestions", desc: "Avoiding I-95 traffic saves 14 mins", icon: Navigation, delay: 0.1 },
    { title: "Risk Detection", desc: "Driver fatigue detected in Vehicle 12", icon: ShieldAlert, delay: 0.3 },
    { title: "Fuel Optimization", desc: "Speed limiting activated for efficiency", icon: Zap, delay: 0.5 },
  ];

  return (
    <section className="py-24 px-6 relative z-10 bg-surface border-y border-border">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-canvas via-surface to-surface pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-dark dark:text-accent border border-accent/20 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-accent" /> Advanced Analytics Assistant
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6 text-ink">
            Let data drive the decisions.
          </h2>
          <p className="text-ink/60 text-lg leading-relaxed mb-8">
            TransitOps doesn't just show you data. Our proprietary analytics engine actively monitors your fleet, predicts failures, and suggests optimizations in real-time.
          </p>
          <ul className="space-y-4">
            {["Predictive Maintenance", "Driver Behavior Analysis", "Automated Compliance Auditing"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-ink/80">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-[400px]">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: insight.delay, duration: 0.8, type: "spring" }}
              whileHover={{ scale: 1.05 }}
              className={`absolute p-4 rounded-2xl bg-canvas border border-border shadow-xl w-72 ${
                i === 0 ? "top-10 left-0" : i === 1 ? "top-40 right-0" : "bottom-10 left-10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/10 rounded-lg text-accent-dark dark:text-accent">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-ink mb-1">{insight.title}</h4>
                  <p className="text-xs text-ink/60 leading-relaxed">{insight.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
