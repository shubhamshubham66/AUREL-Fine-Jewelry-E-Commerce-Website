const STATEMENTS = [
  'Handcrafted in Florence',
  '18K Solid Gold',
  'Certified Diamonds',
  'Free Worldwide Shipping',
  'Lifetime Warranty',
  'Ethically Sourced',
  'Made to Order',
  'Bespoke Engravings',
];

export default function Marquee() {
  return (
    <div
      className="relative overflow-hidden py-5 border-t border-b border-gold/10"
      aria-label="Brand highlights marquee"
    >
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-obsidian to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-obsidian to-transparent z-10" />

      <div className="animate-marquee flex whitespace-nowrap">
        {[...STATEMENTS, ...STATEMENTS].map((text, idx) => (
          <span key={idx} className="flex items-center mx-6 sm:mx-8">
            <span className="text-cream/60 text-sm sm:text-base font-light tracking-wide">
              {text}
            </span>
            <span className="ml-6 sm:ml-8 text-gold/60 text-xs">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
