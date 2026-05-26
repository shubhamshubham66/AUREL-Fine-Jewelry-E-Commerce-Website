import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';

const stats = [
  { number: '38', label: 'Years' },
  { number: '120+', label: 'Artisans' },
  { number: '∞', label: 'Warranty' },
];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury jewelry"
          className="w-full h-[120%] object-cover"
        />
      </motion.div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/40 to-obsidian z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 via-transparent to-transparent z-[1]" />
      <div className="absolute inset-0 bg-radial-gold opacity-40 z-[1]" />

      {/* Floating Gold Orb */}
      <motion.div
        className="absolute top-1/4 right-[15%] w-[400px] h-[400px] rounded-full z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Second Orb */}
      <motion.div
        className="absolute bottom-1/3 left-[10%] w-[250px] h-[250px] rounded-full z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(183,110,121,0.12) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto px-4"
        style={{ opacity }}
      >
        <motion.p
          className="eyebrow justify-center mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Maison AUREL · Est. 1987
        </motion.p>

        <motion.h1
          className="h-display text-cream mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Jewelry Designed to{' '}
          <span className="text-gold-gradient">Outlive</span> Time
        </motion.h1>

        <motion.p
          className="text-cream/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Each piece is hand-finished in our Florence atelier by master artisans
          who believe a jewel should carry the weight of eternity.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <a href="#shop" className="btn-gold">
            Discover the Collection
          </a>
          <a href="#craft" className="btn-outline-gold">
            Inside the Atelier
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex items-center justify-center gap-8 sm:gap-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <span className="block text-gold font-serif text-2xl sm:text-3xl">
                {stat.number}
              </span>
              <span className="text-cream/50 text-xs uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-cream/40 text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-gold/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
