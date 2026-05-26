import { motion } from 'framer-motion';

const stats = [
  { value: 'Florence, IT', label: 'Atelier' },
  { value: 'Antwerp, BE', label: 'Diamond Cutters' },
  { value: '120+', label: 'Master Artisans' },
  { value: '9 days', label: 'Inspection Ritual' },
];

export default function BrandStory() {
  return (
    <section id="story" className="section">
      <div className="container-luxe">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-gold/15">
              <img
                src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80"
                alt="Artisan at work"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />
            </div>

            {/* Secondary Overlapping Image */}
            <motion.div
              className="absolute -bottom-8 -right-8 w-48 h-60 rounded-xl overflow-hidden border border-gold/30 shadow-gold-soft hidden md:block"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80"
                alt="Jewelry detail"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="eyebrow mb-5">The Maison</p>
            <h2 className="h-display mb-8">
              A house built on{' '}
              <span className="text-gold-gradient">patience</span>
            </h2>

            <p className="text-cream/70 leading-relaxed mb-6 text-lg font-light">
              Founded in 1987, Maison AUREL began as a two-person workshop in the
              hills of Florence. Today, over 120 artisans shape every ring, pendant,
              and bracelet by hand — each piece passing through a nine-day inspection
              ritual before it reaches its owner.
            </p>
            <p className="text-cream/60 leading-relaxed mb-10">
              We source conflict-free diamonds from Antwerp and forge our metals in
              solid 18K gold. No shortcuts, no compromises. Only objects worthy of
              being passed down.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="border-l border-gold/30 pl-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <span className="block font-serif text-xl text-cream mb-1">
                    {stat.value}
                  </span>
                  <span className="text-cream/50 text-[10px] uppercase tracking-widest">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
