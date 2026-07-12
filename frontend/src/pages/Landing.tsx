import Hero from "../components/landing/Hero";
import DashboardPreview from "../components/landing/DashboardPreview";
import Features from "../components/landing/Features";
import AISection from "../components/landing/AISection";
import Stats from "../components/landing/Stats";
import Workflow from "../components/landing/Workflow";
import Footer from "../components/landing/Footer";

export default function Landing({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="min-h-screen bg-canvas font-body text-ink selection:bg-brand selection:text-white overflow-x-hidden">
      
      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-canvas/80 backdrop-blur-md border-b border-border/50 transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded flex items-center justify-center text-white font-bold font-display text-lg">
            T
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">
            TransitOps
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="text-ink/70 hover:text-ink transition-colors">Platform</a>
          <a href="#" className="text-ink/70 hover:text-ink transition-colors">Solutions</a>
          <a href="#" className="text-ink/70 hover:text-ink transition-colors">Pricing</a>
          <a href="#" className="text-ink/70 hover:text-ink transition-colors">Documentation</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-sm font-medium text-ink/70 hover:text-ink transition-colors hidden sm:block"
          >
            Sign in
          </button>
          <button 
            onClick={onSignIn}
            className="bg-ink dark:bg-brand-light text-canvas dark:text-brand-dark px-5 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform"
          >
            Launch App
          </button>
        </div>
      </header>

      <Hero onSignIn={onSignIn} />
      <DashboardPreview />
      
      <Features />
      <AISection />
      <Workflow />
      <Stats />

      {/* Final CTA */}
      <section className="py-32 px-6 bg-ink dark:bg-black text-white text-center relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/40 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-display text-5xl md:text-6xl font-semibold mb-8">Ready to modernize your fleet?</h2>
          <p className="text-white/60 text-xl mb-10">Join the thousands of operators scaling faster and safer with TransitOps.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onSignIn}
              className="bg-white text-ink px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform shadow-xl shadow-white/10"
            >
              Launch Dashboard
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
