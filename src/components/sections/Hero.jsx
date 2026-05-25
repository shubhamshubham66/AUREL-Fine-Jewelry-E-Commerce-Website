import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 40, rotateX: 15 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden" aria-label="Hero section">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=80)',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 to-transparent" />
      <div className="absolute inset-0 bg-radial-gold opacity-30" />

      {/* Content */}
      <motion.div
        className="relative z-10 container-luxe perspective-1200"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-2xl preserve-3d">
          <motion.p className="eyebrow mb-4" variants={item}>
            Fine Jewelry Since 1987
          </motion.p>
          <motion.h1 className="h-display text-cream mb-6" variants={item}>
            Designed to <span className="text-gold-gradient">Outlive</span> Time
          </motion.h1>
          <motion.p
            className="text-cream/60 text-base sm:text-lg leading-relaxed max-w-lg mb-8"
            variants={item}
          >
            Handcrafted luxury in 18K gold with certified diamonds. Each piece is a legacy,
            meticulously forged by master artisans in our Florence atelier.
          </motion.p>
          <motion.div className="flex flex-wrap gap-4" variants={item}>
            <a href="#shop" className="btn-gold" aria-label="Explore collection">
              Explore Collection
            </a>
            <a href="#story" className="btn-outline-gold" aria-label="Our story">
              Our Story
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-cream/40 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gold/50"
          animate={{ scaleY: [1, 1.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
