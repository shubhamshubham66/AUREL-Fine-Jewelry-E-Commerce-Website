import { motion } from 'framer-motion';
import { CATEGORIES } from '../../data/products.js';

export default function CategoryGrid() {
  return (
    <section id="collections" className="section bg-obsidian">
      <div className="container-luxe">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="eyebrow justify-center">The Collections</span>
          <h2 className="h-display mt-4 text-cream">
            Explore by <span className="text-gold-gradient">Category</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.a
              key={cat.id}
              href={`#${cat.id}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              whileHover={{ y: -8 }}
              className="group relative aspect-[3/4] rounded-sm overflow-hidden cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent" />
              <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/30 transition-all duration-500 rounded-sm" />

              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="font-serif text-2xl text-cream group-hover:text-gold transition-colors duration-300">
                  {cat.name}
                </h3>
                <p className="text-sm text-cream/50 mt-1 font-light">{cat.tagline}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
