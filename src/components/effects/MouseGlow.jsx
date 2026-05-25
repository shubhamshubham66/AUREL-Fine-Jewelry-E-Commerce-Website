import { useEffect, useRef } from 'react';

export default function MouseGlow() {
  const primaryRef = useRef(null);
  const secondaryRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const primaryPos = useRef({ x: 0, y: 0 });
  const secondaryPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Primary: faster follow (easing 0.14)
      primaryPos.current.x += (mousePos.current.x - primaryPos.current.x) * 0.14;
      primaryPos.current.y += (mousePos.current.y - primaryPos.current.y) * 0.14;

      // Secondary: slower trailing (easing 0.06)
      secondaryPos.current.x += (mousePos.current.x - secondaryPos.current.x) * 0.06;
      secondaryPos.current.y += (mousePos.current.y - secondaryPos.current.y) * 0.06;

      if (primaryRef.current) {
        primaryRef.current.style.transform = `translate(${primaryPos.current.x - 200}px, ${primaryPos.current.y - 200}px)`;
      }
      if (secondaryRef.current) {
        secondaryRef.current.style.transform = `translate(${secondaryPos.current.x - 300}px, ${secondaryPos.current.y - 300}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Primary Glow - faster, smaller */}
      <div
        ref={primaryRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 60%)',
          filter: 'blur(30px)',
          mixBlendMode: 'screen',
          willChange: 'transform',
        }}
      />

      {/* Secondary Glow - slower, larger */}
      <div
        ref={secondaryRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(183,110,121,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
          willChange: 'transform',
        }}
      />
    </>
  );
}
