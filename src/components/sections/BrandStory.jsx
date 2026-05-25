import { motion } from 'framer-motion';

const stats = [
  { label: 'Florence, IT', value: 'Atelier' },
  { label: 'Antwerp, BE', value: 'Sourcing' },
  { label: '120+', value: 'Artisans' },
  { label: '9 Days', value: 'Per Piece' },
];

export default function BrandStory() {
  return (
    <section className="section" id="story" aria-label="Brand story">
      <div className="container-luxe">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Images */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-[4/5] rounded-lg overflow-hidden border border-gold/10">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80"
                alt="Master artisan crafting jewelry"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block absolute -bottom-6 -right-6 w-48 lg:w-56 aspect-square rounded-lg overflow-hidden border-2 border-obsidian shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80"
                alt="Close-up of handcrafted gold pendant"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="eyebrow mb-4">Our Heritage</p>
            <h2 className="h-display text-cream mb-6">
              Where Legacy Meets <span className="text-gold-gradient">Craft</span>
            </h2>
            <p className="text-cream/60 leading-relaxed mb-4">
              Founded in 1987, AUREL began as a small family atelier in Florence, Italy.
              Three generations of master goldsmiths have refined techniques passed down
              through centuries, blending old-world artistry with contemporary design.
            </p>
            <p className="text-cream/60 leading-relaxed mb-8">
              Every piece begins with a sketch, moves through wax casting, and is finished
              by hand using tools that have shaped gold for over a hundred years. We source
              our diamonds exclusively from Antwerp, ensuring ethical provenance and
              exceptional brilliance.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-onyx/40 border border-cream/5">
                  <p className="text-gold font-serif text-lg">{stat.label}</p>
                  <p className="text-cream/40 text-xs uppercase tracking-widest mt-1">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
