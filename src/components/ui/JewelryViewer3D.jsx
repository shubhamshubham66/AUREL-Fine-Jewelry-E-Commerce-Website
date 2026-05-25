import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * CSS 3D Jewelry Viewer - Pure CSS transforms with drag interaction.
 * No WebGL, no Three.js - uses perspective, rotateY, rotateX for 3D effect.
 */
export default function JewelryViewer3D({ metalColor = '#D4AF37', image }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const rotationRef = useRef({ x: -15, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0.4 });
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: -15, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Animation loop - auto-rotate when not dragging
  useEffect(() => {
    const animate = () => {
      if (!isDraggingRef.current) {
        // Apply velocity with damping
        velocityRef.current.y *= 0.995;
        if (Math.abs(velocityRef.current.y) < 0.3) {
          velocityRef.current.y = 0.4; // Maintain minimum auto-rotation
        }
        velocityRef.current.x *= 0.95;

        rotationRef.current.x += velocityRef.current.x;
        rotationRef.current.y += velocityRef.current.y;

        // Clamp X rotation
        rotationRef.current.x = Math.max(-40, Math.min(40, rotationRef.current.x));

        setRotation({ ...rotationRef.current });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - lastPointerRef.current.x;
    const deltaY = e.clientY - lastPointerRef.current.y;

    rotationRef.current.y += deltaX * 0.5;
    rotationRef.current.x += deltaY * 0.3;
    rotationRef.current.x = Math.max(-40, Math.min(40, rotationRef.current.x));

    velocityRef.current = { x: deltaY * 0.1, y: deltaX * 0.2 };

    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    setRotation({ ...rotationRef.current });
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Generate face data for the 6-sided gem shape
  const faces = [];
  const faceCount = 6;
  for (let i = 0; i < faceCount; i++) {
    const angle = (i / faceCount) * 360;
    faces.push({ angle, index: i });
  }

  // Determine gradient based on metal color
  const getGradient = (faceIndex) => {
    const gradients = [
      `linear-gradient(135deg, ${metalColor}33 0%, ${metalColor}11 50%, transparent 100%)`,
      `linear-gradient(225deg, ${metalColor}22 0%, ${metalColor}0a 60%, transparent 100%)`,
      `linear-gradient(45deg, ${metalColor}44 0%, ${metalColor}11 40%, transparent 100%)`,
      `linear-gradient(315deg, ${metalColor}33 0%, transparent 60%)`,
      `linear-gradient(180deg, ${metalColor}22 0%, ${metalColor}0a 50%, transparent 100%)`,
      `linear-gradient(0deg, ${metalColor}44 0%, ${metalColor}11 50%, transparent 100%)`,
    ];
    return gradients[faceIndex % gradients.length];
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[280px] relative select-none overflow-hidden"
      style={{ minHeight: '280px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Interactive 3D jewelry viewer - drag to rotate"
      role="img"
    >
      {/* Gold radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${metalColor}25 0%, transparent 70%)`,
        }}
      />

      {/* Perspective container */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        {/* 3D rotating gem */}
        <div
          className="relative"
          style={{
            width: '240px',
            height: '240px',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? 'none' : 'transform 0.05s linear',
          }}
        >
          {/* Six faces of the gem */}
          {faces.map(({ angle, index }) => (
            <div
              key={index}
              className="absolute inset-0 rounded-lg overflow-hidden"
              style={{
                transform: `rotateY(${angle}deg) translateZ(120px)`,
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Product image on face */}
              {image && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-70"
                  style={{ backgroundImage: `url(${image})` }}
                />
              )}

              {/* Gold gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: getGradient(index) }}
              />

              {/* Metallic edge highlight */}
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  border: `1px solid ${metalColor}44`,
                  boxShadow: `inset 0 0 30px ${metalColor}15`,
                }}
              />

              {/* Shine sweep animation */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
              >
                <div
                  className="absolute top-0 -left-full w-1/2 h-full skew-x-[-20deg]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${metalColor}40, transparent)`,
                    animation: `shineSweep 3s ease-in-out infinite`,
                    animationDelay: `${index * 0.5}s`,
                  }}
                />
              </div>
            </div>
          ))}

          {/* Center gem sparkle */}
          <div
            className="absolute rounded-full"
            style={{
              width: '40px',
              height: '40px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) translateZ(130px)',
              background: `radial-gradient(circle, white 0%, ${metalColor}88 40%, transparent 70%)`,
              boxShadow: `0 0 30px ${metalColor}66, 0 0 60px ${metalColor}33`,
            }}
          />
        </div>
      </div>

      {/* Reflective gold floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${metalColor}12 0%, ${metalColor}08 30%, transparent 100%)`,
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        }}
      />

      {/* Reflective floor line */}
      <div
        className="absolute bottom-[28%] left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '200px',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${metalColor}44, transparent)`,
        }}
      />

      {/* Drag hint text */}
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-cream/40">
          Drag to rotate
        </span>
      </div>

      {/* Keyframe animation styles */}
      <style>{`
        @keyframes shineSweep {
          0% { left: -100%; }
          50% { left: 200%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
}
