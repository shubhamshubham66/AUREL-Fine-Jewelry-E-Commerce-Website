import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { INSTAGRAM_GALLERY } from '../../data/products.js';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export default function InstagramGallery() {
  return (
    <section className="section" aria-label="Instagram gallery">
      <div className="container-luxe">
        <div className="text-center mb-10 md:mb-14">
          <p className="eyebrow justify-center mb-3">@aurel.jewelry</p>
          <h2 className="h-display text-cream">
            From Our <span className="text-gold-gradient">Atelier</span>
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {INSTAGRAM_GALLERY.map((img, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="group relative aspect-square rounded-md overflow-hidden cursor-pointer"
            >
              <img
                src={img}
                alt={`Jewelry gallery image ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-obsidian/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-6 h-6 text-cream" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
