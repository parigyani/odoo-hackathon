import { motion } from "framer-motion";

export default function DashboardPreview() {
  return (
    <section className="relative px-6 -mt-10 pb-24 max-w-6xl mx-auto z-20">
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, type: "spring", bounce: 0.2 }}
        className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-white dark:bg-[#090E17]"
      >
        {/* Fake Browser Header */}
        <div className="flex items-center px-4 py-3 border-b border-border/50 bg-canvas dark:bg-black/40">
          <div className="flex gap-2 mr-6">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          
          <div className="flex-1 max-w-xl mx-auto bg-white dark:bg-black/50 rounded-md py-1.5 px-4 flex items-center gap-2 text-xs text-ink/40 dark:text-white/40 border border-border/50">
            🔒 transitops.app/dashboard
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex min-h-[500px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-border/50 p-6 hidden md:flex flex-col gap-6 bg-canvas dark:bg-transparent">
            <div className="flex items-center gap-2 text-xl font-display font-bold text-ink">
              <div className="w-6 h-6 bg-brand rounded flex items-center justify-center text-xs text-white">T</div>
              TransitOps
            </div>
            
            <nav className="space-y-1 mt-4">
              <div className="bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light px-3 py-2 rounded font-medium text-sm">
                Dashboard
              </div>
              {["Fleet Registry", "Live Board", "Maintenance", "Analytics"].map((item) => (
                <div key={item} className="text-ink/60 px-3 py-2 rounded font-medium text-sm">
                  {item}
                </div>
              ))}
            </nav>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-8 bg-surface dark:bg-[#0B132B]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-semibold text-ink">Fleet Overview</h2>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-canvas dark:bg-black/30 rounded border border-border/50 text-sm text-ink/70">
                  Last 24 Hours
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-5 rounded-xl border border-border/50 bg-white dark:bg-surface">
                <p className="text-sm text-ink/60 mb-2">Fleet Utilization</p>
                <p className="text-3xl font-display font-bold text-ink">94.2%</p>
                <p className="text-xs text-success mt-2">↑ +2.1% this week</p>
              </div>
              <div className="p-5 rounded-xl border border-border/50 bg-white dark:bg-surface">
                <p className="text-sm text-ink/60 mb-2">Active Trips</p>
                <p className="text-3xl font-display font-bold text-ink">34</p>
                <p className="text-xs text-success mt-2">All on schedule</p>
              </div>
              <div className="p-5 rounded-xl border border-border/50 bg-white dark:bg-surface">
                <p className="text-sm text-ink/60 mb-2">Maintenance Alerts</p>
                <p className="text-3xl font-display font-bold text-danger">2</p>
                <p className="text-xs text-danger mt-2">Requires attention</p>
              </div>
            </div>

            {/* Fake Table */}
            <div className="rounded-xl border border-border/50 bg-white dark:bg-surface overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 flex justify-between items-center">
                <h3 className="font-semibold text-ink">Today's Active Trips</h3>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { id: "TRP-1029", route: "Chicago → Detroit", status: "In Transit", driver: "A. Smith" },
                  { id: "TRP-1030", route: "New York → Boston", status: "Delayed", driver: "M. Johnson" },
                  { id: "TRP-1031", route: "Miami → Atlanta", status: "In Transit", driver: "D. Lee" },
                ].map((trip, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 pb-2 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-ink">{trip.id}</p>
                      <p className="text-xs text-ink/50">{trip.route}</p>
                    </div>
                    <div className="text-sm text-ink/70">{trip.driver}</div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      trip.status === "Delayed" ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                    }`}>
                      {trip.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Fade out effect to blend into the page */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
}
