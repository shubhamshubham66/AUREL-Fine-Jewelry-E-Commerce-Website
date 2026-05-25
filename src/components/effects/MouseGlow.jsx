import { useEffect, useRef, useState } from 'react';

export default function MouseGlow() {
  const glowRef = useRef(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouse = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      position.current.x += (target.current.x - position.current.x) * 0.08;
      position.current.y += (target.current.y - position.current.y) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${position.current.x - 150}px, ${position.current.y - 150}px)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[300px] h-[300px] pointer-events-none z-[9999]"
      style={{
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        opacity: 0.18,
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  );
}
