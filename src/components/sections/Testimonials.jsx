import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../data/products.js';

export default function Testimonials() {
  return (
    <section className="section bg-obsidian">
      <div className="container-luxe">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="eyebrow justify-center">Voices</span>
          <h2 className="h-display mt-4 text-cream">
            Our <span className="text-gold-gradient">Clients</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              className="p-8 glass rounded-sm relative group hover:border-gold/20 transition-all duration-500"
            >
              <Quote size={32} className="text-gold/20 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="text-gold fill-gold" />
                ))}
              </div>
              <p className="text-cream/70 leading-relaxed font-light italic">
                "{t.quote}"
              </p>
              <div className="mt-6 pt-4 border-t border-gold/10">
                <p className="text-sm font-semibold text-cream">{t.name}</p>
                <p className="text-xs text-cream/50 mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
