export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border/50 bg-canvas dark:bg-brand-dark/50 relative z-10 text-center md:text-left">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand rounded flex items-center justify-center text-white font-bold font-display text-xs">
            T
          </div>
          <span className="font-display font-semibold text-ink tracking-tight">
            TransitOps
          </span>
        </div>
        <nav className="flex gap-8 text-sm text-ink/60">
          <a href="#" className="hover:text-ink transition-colors">Company</a>
          <a href="#" className="hover:text-ink transition-colors">Documentation</a>
          <a href="#" className="hover:text-ink transition-colors">GitHub</a>
          <a href="#" className="hover:text-ink transition-colors">Privacy</a>
          <a href="#" className="hover:text-ink transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
