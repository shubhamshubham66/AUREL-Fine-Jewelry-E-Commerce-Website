import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { INSTAGRAM_GALLERY } from '../../data/products.js';

export default function InstagramGallery() {
  return (
    <section className="section bg-onyx/30">
      <div className="container-luxe">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="eyebrow justify-center">
            <Instagram size={14} /> @aurel.jewelry
          </span>
          <h2 className="h-display mt-4 text-cream">
            Follow the <span className="text-gold-gradient">Brilliance</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {INSTAGRAM_GALLERY.map((img, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="group relative aspect-square rounded-sm overflow-hidden"
            >
              <img
                src={img}
                alt={`Gallery image ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/50 transition-all duration-300 flex items-center justify-center">
                <Instagram size={24} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
