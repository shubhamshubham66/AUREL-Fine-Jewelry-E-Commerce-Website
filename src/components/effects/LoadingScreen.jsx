import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-obsidian flex flex-col items-center justify-center"
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Corner Decorations */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-gold/30" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-gold/30" />

          {/* Logo Container */}
          <div className="relative flex items-center justify-center w-28 h-28 mb-8">
            {/* Outer Spinning Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner Pulsing Ring */}
            <motion.div
              className="absolute inset-3 rounded-full border border-gold/30"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* A Letter */}
            <span className="text-gold-gradient font-serif text-4xl font-light select-none">
              A
            </span>
          </div>

          {/* Brand Name */}
          <motion.p
            className="font-serif text-cream text-xl tracking-[0.5em] mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            AUREL
          </motion.p>

          {/* Tagline */}
          <motion.p
            className="text-cream/40 text-[10px] uppercase tracking-[0.3em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Designed to Outlive Time
          </motion.p>

          {/* Progress Bar */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-px bg-gold/10 overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-gold/80 via-gold to-rosegold"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
