import { motion } from 'framer-motion';
import { TESTIMONIALS } from '../../data/products.js';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Testimonials() {
  return (
    <section className="section" aria-label="Customer testimonials">
      <div className="container-luxe">
        <div className="text-center mb-12 md:mb-16">
          <p className="eyebrow justify-center mb-3">Voices</p>
          <h2 className="h-display text-cream">
            Trusted by <span className="text-gold-gradient">Collectors</span>
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.id}
              variants={item}
              className="p-6 sm:p-8 rounded-lg glass border border-cream/5"
            >
              <span className="text-gold/40 text-4xl font-serif leading-none block mb-4">"</span>
              <p className="text-cream/70 font-serif text-base sm:text-lg italic leading-relaxed mb-6">
                {t.quote}
              </p>
              <div className="hairline mb-4" />
              <p className="text-cream font-medium text-sm">{t.name}</p>
              <p className="text-cream/40 text-xs">{t.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
