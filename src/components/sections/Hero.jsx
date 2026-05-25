import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=80)',
          transform: `translateY(${scrollY * 0.4}px) scale(1.1)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian" />
      <div className="absolute inset-0 bg-radial-gold opacity-40" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 perspective-1200">
        <motion.div
          initial={{ opacity: 0, rotateX: 15, y: 60 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="preserve-3d"
        >
          <span className="eyebrow mb-6 justify-center">Est. 2024</span>
          <h1 className="h-display text-cream mt-6">
            Jewelry Designed to
            <br />
            <span className="text-gold-gradient">Outlive Time</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-cream/60 text-lg font-light leading-relaxed">
            Each piece in the AUREL collection is handcrafted from ethically sourced diamonds and precious metals — a testament to heritage, patience, and enduring beauty.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#collections" className="btn-gold">
            Explore Collection
          </a>
          <a href="#story" className="btn-outline-gold">
            Our Story
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-gold/60"
        >
          <ArrowDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}
