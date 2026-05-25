import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../data/products.js';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Testimonials() {
  return (
    <section id="journal" className="section">
      <div className="container-luxe">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow justify-center mb-4">Voices</p>
          <h2 className="h-display">Worn by the Discerning</h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="glass rounded-2xl p-8 flex flex-col"
              variants={cardVariants}
            >
              <Quote className="w-8 h-8 text-gold/40 mb-5 shrink-0" />
              <p className="font-serif text-cream/80 text-lg leading-relaxed italic flex-1 mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="hairline mb-5" />
              <div>
                <p className="text-cream font-medium text-sm">{testimonial.name}</p>
                <p className="text-cream/50 text-xs tracking-wide mt-0.5">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
