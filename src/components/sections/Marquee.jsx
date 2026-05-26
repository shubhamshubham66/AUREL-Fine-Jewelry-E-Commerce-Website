const ITEMS = [
  'Free Worldwide Shipping',
  'Certified Diamonds',
  '18K Solid Gold',
  'Lifetime Warranty',
  'Hand-finished in Florence',
  'Complimentary Engraving',
];

export default function Marquee() {
  const row = ITEMS.map((item, i) => (
    <span key={i} className="flex items-center gap-8 shrink-0">
      <span className="text-cream/70 text-sm tracking-wide whitespace-nowrap font-light">
        {item}
      </span>
      <span className="text-gold/60 text-xs">✦</span>
    </span>
  ));

  return (
    <div className="relative border-y border-gold/15 bg-onyx/50 py-5 overflow-hidden">
      {/* Edge Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-obsidian to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-obsidian to-transparent z-10 pointer-events-none" />

      {/* Scrolling Content */}
      <div className="flex animate-marquee">
        <div className="flex items-center gap-8 shrink-0 pr-8">
          {row}
        </div>
        <div className="flex items-center gap-8 shrink-0 pr-8">
          {row}
        </div>
      </div>
    </div>
  );
}
