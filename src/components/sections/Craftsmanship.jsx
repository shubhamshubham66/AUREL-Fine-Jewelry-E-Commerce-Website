import { motion } from 'framer-motion';
import { Gem, Hammer, Sparkles, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: Gem,
    number: '01',
    title: 'Sourcing',
    description: 'Conflict-free diamonds hand-selected in Antwerp for clarity, cut, and fire.',
  },
  {
    icon: Hammer,
    number: '02',
    title: 'Forging',
    description: 'Molten 18K gold poured into hand-carved wax molds by master casters.',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Setting',
    description: 'Each stone placed with precision under magnification, secured for generations.',
  },
  {
    icon: ShieldCheck,
    number: '04',
    title: 'Inspection',
    description: 'Triple quality check ensuring every facet meets our exacting standards.',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Craftsmanship() {
  return (
    <section className="section relative overflow-hidden" id="craft" aria-label="Craftsmanship">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/90 to-obsidian" />

      <div className="container-luxe relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <p className="eyebrow justify-center mb-3">The Process</p>
          <h2 className="h-display text-cream">
            Master <span className="text-gold-gradient">Craftsmanship</span>
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={item}
                className="group p-6 rounded-lg bg-onyx/40 border border-cream/5 hover:border-gold/30 transition-all duration-500 relative overflow-hidden"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-radial-gold opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                <div className="relative z-10">
                  <Icon className="w-8 h-8 text-gold mb-4" />
                  <span className="text-gold/40 text-xs font-mono">{step.number}</span>
                  <h3 className="text-cream font-serif text-xl mt-2 mb-3">{step.title}</h3>
                  <p className="text-cream/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
