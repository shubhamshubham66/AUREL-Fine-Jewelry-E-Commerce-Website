import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[60] hidden md:block"
      aria-hidden="true"
    >
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,1) 0%, transparent 70%)',
          left: pos.x - 250,
          top: pos.y - 250,
          transition: 'left 0.15s ease-out, top 0.15s ease-out',
        }}
      />
    </motion.div>
  );
}
