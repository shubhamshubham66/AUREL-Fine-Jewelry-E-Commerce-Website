import { motion } from 'framer-motion';
import { Sparkles, Shield, Award, Clock } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'Hand-Set Stones', desc: 'Each diamond is individually placed by our master setters using microscopic precision tools.' },
  { icon: Shield, title: 'Certified Origin', desc: 'Every gemstone comes with full provenance documentation and ethical sourcing certificates.' },
  { icon: Award, title: 'Hallmark Quality', desc: 'All metals carry official assay hallmarks verifying purity and composition.' },
  { icon: Clock, title: '200+ Hour Process', desc: 'From raw sketch to final polish, each piece undergoes over 200 hours of meticulous craft.' },
];

export default function Craftsmanship() {
  return (
    <section id="craftsmanship" className="section bg-onyx/30">
      <div className="container-luxe">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="eyebrow justify-center">The Process</span>
          <h2 className="h-display mt-4 text-cream">
            Uncompromising <span className="text-gold-gradient">Craftsmanship</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-cream/50 text-lg font-light">
            Every detail speaks to generations of inherited skill and relentless pursuit of perfection.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              whileHover={{ y: -6 }}
              className="p-8 glass rounded-sm text-center group hover:border-gold/30 transition-all duration-500"
            >
              <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-gold/10 group-hover:bg-gold/20 transition-colors duration-300">
                <feat.icon size={24} className="text-gold" />
              </div>
              <h3 className="mt-5 font-serif text-lg text-cream group-hover:text-gold transition-colors duration-300">
                {feat.title}
              </h3>
              <p className="mt-3 text-sm text-cream/50 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
