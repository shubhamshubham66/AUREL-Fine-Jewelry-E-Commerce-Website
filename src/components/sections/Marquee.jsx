import { motion } from 'framer-motion';

export default function Marquee() {
  const items = ['18K Gold', 'VVS Diamonds', 'Handcrafted', 'Ethically Sourced', 'Limited Editions', 'Lifetime Warranty', 'Bespoke Design', 'Heritage Craft'];

  return (
    <section className="py-6 border-y border-gold/10 overflow-hidden bg-onyx/50">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-sm md:text-base text-cream/40 font-serif italic tracking-wide flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
