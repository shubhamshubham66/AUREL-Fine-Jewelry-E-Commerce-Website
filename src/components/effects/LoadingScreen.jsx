import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 400);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-obsidian"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8"
          >
            <h1 className="font-serif text-5xl md:text-7xl text-gold-gradient tracking-widest">
              AUREL
            </h1>
            <p className="text-cream/50 text-sm tracking-[0.3em] uppercase font-sans">
              Fine Jewelry
            </p>
            <div className="w-48 h-px bg-onyx relative overflow-hidden rounded-full mt-4">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold via-gold/80 to-rosegold rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-gold/60 text-xs font-sans tracking-wider">
              {Math.min(Math.round(progress), 100)}%
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
