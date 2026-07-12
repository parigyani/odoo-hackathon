import { motion } from "framer-motion";
import { ArrowRight, Play, Activity, AlertTriangle, CheckCircle, Navigation } from "lucide-react";

export default function Hero({ onSignIn }: { onSignIn: () => void }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
      {/* Background gradients for the hero */}
      <div className="absolute inset-0 -z-10 pointer-events-none flex justify-center items-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-[600px] h-[600px] bg-brand/20 dark:bg-brand-light/10 blur-[120px] rounded-full absolute top-0"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="w-[500px] h-[500px] bg-accent/20 dark:bg-accent-dark/10 blur-[100px] rounded-full absolute -right-20 top-20"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-ink leading-[1.1]">
          Smarter Fleet Operations. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-dark dark:from-accent dark:to-brand-light">Built for Scale.</span>
        </h1>
        <p className="mt-8 text-ink/70 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          The next-generation logistics operating system. Centralize fleet management, dispatching, driver safety, and analytics into one unified, intelligent platform.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onSignIn}
            className="group flex items-center gap-2 bg-ink dark:bg-surface text-canvas dark:text-ink px-8 py-4 rounded-full text-sm font-semibold hover:scale-105 transition-all shadow-xl hover:shadow-accent/20"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-ink/10 dark:border-white/10 text-ink px-8 py-4 rounded-full text-sm font-semibold hover:bg-white/80 dark:hover:bg-black/40 transition-colors">
            <Play className="w-4 h-4" fill="currentColor" />
            View Demo
          </button>
        </div>
      </motion.div>

      {/* Interactive AI Control Panel Mockup */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="mt-20 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="md:col-span-2 bg-surface backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-ink flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Live Fleet Analysis
            </h3>
            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Optimal
            </span>
          </div>
          <div className="space-y-4">
            {[
              { label: "Route 4B Re-optimized to avoid traffic", type: "success", icon: Navigation, time: "Just now" },
              { label: "Vehicle #14 predictive maintenance alert", type: "warning", icon: AlertTriangle, time: "2m ago" },
              { label: "Fuel consumption dropped by 12% across fleet", type: "success", icon: CheckCircle, time: "15m ago" }
            ].map((event, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + (i * 0.2) }}
                className="flex items-center justify-between p-3 bg-canvas rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${event.type === 'success' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
                    <event.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-ink/80">{event.label}</span>
                </div>
                <span className="text-xs text-ink/40">{event.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-brand text-white dark:bg-brand-light rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
              <Activity className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <p className="text-white/70 text-sm font-medium mb-1">Fleet Health Score</p>
              <h4 className="text-4xl font-display font-bold">98.2%</h4>
              <p className="text-xs text-white/50 mt-2 flex items-center gap-1">
                ↑ +1.4% from last week
              </p>
            </div>
          </div>
          <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-6 shadow-lg flex-1 flex flex-col justify-center">
            <p className="text-ink/60 text-sm font-medium mb-1">Active Vehicles</p>
            <div className="flex items-end gap-2">
              <h4 className="text-3xl font-display font-bold text-ink">124</h4>
              <p className="text-sm text-ink/40 mb-1">/ 130</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
