nimport { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../../data/products.js';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function CategoryGrid() {
  return (
    <section id="collections" className="section">
      <div className="container-luxe">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow justify-center mb-4">Collections</p>
          <h2 className="h-display">Curated by Desire</h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {CATEGORIES.map((cat, index) => (
            <motion.a
              key={cat.id}
              href={`#shop`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden block"
              variants={cardVariants}
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />

              {/* Gold Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-gold/80 text-[10px] tracking-widest font-sans uppercase block mb-2">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-serif text-2xl text-cream mb-1">
                  {cat.name}
                </h3>
                <p className="text-cream/60 text-xs tracking-wide">
                  {cat.tagline}
                </p>
              </div>

              {/* Arrow */}
              <div className="absolute top-5 right-5">
                <div className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-500">
                  <ArrowUpRight className="w-4 h-4 text-cream/60 group-hover:text-obsidian transition-colors duration-500" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
