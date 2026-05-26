import { motion } from 'framer-motion';
import { Gem, Hammer, Sparkles, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: Gem,
    number: '01',
    title: 'Sourcing',
    description: 'Conflict-free diamonds hand-selected in Antwerp. Only D-F colour, VVS clarity stones pass our criteria.',
  },
  {
    icon: Hammer,
    number: '02',
    title: 'Forging',
    description: 'Solid 18K gold is alloyed and cast in our Florence atelier using traditional lost-wax techniques.',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Setting',
    description: 'Master setters place each stone under 40× magnification, ensuring flawless symmetry and light return.',
  },
  {
    icon: ShieldCheck,
    number: '04',
    title: 'Inspection',
    description: 'Nine days. 47 checkpoints. Every piece is stress-tested, polished, and certified before leaving the atelier.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Craftsmanship() {
  return (
    <section id="craft" className="section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1600&q=60"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-[0.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/95 to-obsidian" />
      </div>

      <div className="container-luxe relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow justify-center mb-4">The Process</p>
          <h2 className="h-display">Four Pillars of Perfection</h2>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                className="group relative rounded-2xl border border-gold/15 bg-gradient-to-b from-onyx to-obsidian p-7 transition-all duration-500 hover:border-gold/40 hover:shadow-gold-soft"
                variants={cardVariants}
              >
                {/* Number */}
                <span className="text-gold/30 text-[10px] tracking-widest font-sans uppercase block mb-5">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mb-5 group-hover:bg-gold/10 group-hover:border-gold/60 transition-all duration-500">
                  <Icon className="w-5 h-5 text-gold/70 group-hover:text-gold transition-colors duration-500" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl text-cream mb-3">{step.title}</h3>

                {/* Description */}
                <p className="text-cream/50 text-sm leading-relaxed">{step.description}</p>

                {/* Hover Gold Glow */}
                <div className="absolute inset-0 rounded-2xl bg-radial-gold opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
