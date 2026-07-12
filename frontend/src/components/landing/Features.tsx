import { motion } from "framer-motion";
import { Route, PenTool as Tool, Map, Shield, TrendingUp, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Route,
    title: "Dynamic Route Optimization",
    description: "Dynamically recalculate routes in real-time based on traffic, weather, and vehicle load to save hours of drive time."
  },
  {
    icon: Tool,
    title: "Predictive Maintenance",
    description: "Advanced analytics models analyze vehicle telemetry to predict breakdowns before they happen, reducing costly downtime."
  },
  {
    icon: Map,
    title: "Live Fleet Tracking",
    description: "Sub-second latency tracking across your entire fleet. See exactly where your assets are on a global interactive map."
  },
  {
    icon: Shield,
    title: "Driver Safety Monitoring",
    description: "Smart dashcam integration detects harsh braking, speeding, and fatigue, instantly alerting dispatchers to potential risks."
  },
  {
    icon: TrendingUp,
    title: "Expense Intelligence",
    description: "Automatically reconcile fuel cards and maintenance invoices. Our system flags anomalies and suggests areas for cost reduction."
  },
  {
    icon: BarChart3,
    title: "Fleet ROI Analytics",
    description: "Customizable dashboards that translate raw telemetry into executive-ready reports on fleet profitability and utilization."
  }
];

export default function Features() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-4xl font-semibold text-ink tracking-tight mb-4">
          Everything you need to run a modern fleet
        </h2>
        <p className="text-ink/60 text-lg">
          Replace your fragmented legacy tools with a unified platform designed from the ground up for the AI era.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="group p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-border/50 hover:border-accent/50 transition-colors backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 bg-canvas dark:bg-black/30 rounded-xl flex items-center justify-center text-accent mb-6 shadow-sm border border-border/30">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">{feature.title}</h3>
            <p className="text-ink/60 leading-relaxed text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
