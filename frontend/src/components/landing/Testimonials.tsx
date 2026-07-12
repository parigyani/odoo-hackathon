export default function Testimonials() {
  const testimonials = [
    {
      quote: "TransitOps replaced three legacy systems. The dynamic route optimization alone saved us 15% in fuel costs in the first quarter.",
      name: "Sarah Jenkins",
      title: "VP of Logistics, FreightFlow"
    },
    {
      quote: "The predictive maintenance module is uncannily accurate. We haven't had an unexpected roadside breakdown in six months.",
      name: "Marcus Chen",
      title: "Fleet Director, UrbanTransit"
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="p-10 rounded-3xl bg-white/50 dark:bg-surface/50 border border-border/50 backdrop-blur-sm">
            <p className="text-xl md:text-2xl font-display font-medium text-ink leading-relaxed mb-8">
              "{t.quote}"
            </p>
            <div>
              <p className="font-semibold text-ink">{t.name}</p>
              <p className="text-sm text-ink/60">{t.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
