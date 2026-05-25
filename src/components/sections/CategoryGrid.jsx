import { motion } from 'framer-motion';
import { CATEGORIES } from '../../data/products.js';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function CategoryGrid() {
  return (
    <section className="section" id="collections" aria-label="Collections">
      <div className="container-luxe">
        <div className="text-center mb-12 md:mb-16">
          <p className="eyebrow justify-center mb-3">Collections</p>
          <h2 className="h-display text-cream">
            Curated <span className="text-gold-gradient">Categories</span>
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {CATEGORIES.map((cat, idx) => (
            <motion.a
              key={cat.id}
              href={`#${cat.id}`}
              variants={item}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden block"
              aria-label={`View ${cat.name} collection`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <span className="text-gold/60 text-xs font-mono mb-1">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="text-cream font-serif text-xl sm:text-2xl mb-1">{cat.name}</h3>
                <p className="text-cream/50 text-sm">{cat.tagline}</p>
                <div className="mt-3 w-8 h-8 rounded-full border border-cream/20 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                  <span className="text-cream group-hover:text-obsidian text-sm transition-colors">
                    →
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
