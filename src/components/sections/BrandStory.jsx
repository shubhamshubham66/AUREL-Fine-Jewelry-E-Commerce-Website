import { motion } from 'framer-motion';
import { Gem } from 'lucide-react';

export default function BrandStory() {
  return (
    <section id="story" className="section bg-obsidian relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
      <div className="container-luxe relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9 }}
          >
            <span className="eyebrow">Our Heritage</span>
            <h2 className="h-display mt-4 text-cream">
              A Legacy of <span className="text-gold-gradient">Quiet Luxury</span>
            </h2>
            <p className="mt-6 text-cream/60 leading-relaxed text-lg font-light">
              Founded on the belief that true luxury whispers rather than shouts, AUREL represents a new chapter in fine jewelry. Every piece begins as a sketch in our Geneva atelier, passes through the hands of master artisans, and arrives as a legacy in waiting.
            </p>
            <p className="mt-4 text-cream/60 leading-relaxed">
              We source only conflict-free diamonds and recycled precious metals, ensuring that the beauty you wear carries no hidden cost. Our commitment is to craft jewelry that appreciates in meaning with every year it is worn.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <div className="text-center">
                <p className="font-serif text-3xl text-gold">200+</p>
                <p className="text-xs text-cream/50 mt-1">Artisan Hours Per Piece</p>
              </div>
              <div className="w-px h-12 bg-gold/20" />
              <div className="text-center">
                <p className="font-serif text-3xl text-gold">99.9%</p>
                <p className="text-xs text-cream/50 mt-1">Pure Gold Standard</p>
              </div>
              <div className="w-px h-12 bg-gold/20" />
              <div className="text-center">
                <p className="font-serif text-3xl text-gold">∞</p>
                <p className="text-xs text-cream/50 mt-1">Lifetime Warranty</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80"
                alt="AUREL craftsmanship"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 p-6 glass rounded-sm">
              <Gem className="text-gold mb-2" size={24} />
              <p className="text-sm text-cream/80 font-serif italic">
                "Patience is the truest form of luxury."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
