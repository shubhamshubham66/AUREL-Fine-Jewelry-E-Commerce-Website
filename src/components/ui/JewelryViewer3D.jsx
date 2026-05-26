import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Lenskart-style Premium 3D Jewelry Viewer
 * Smooth auto-rotation + drag interaction + luxury feel
 */
export default function JewelryViewer3D({
  metalColor = "#D4AF37",
  image,
}) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const rotationRef = useRef({ x: -15, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0.25 });

  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const [rotation, setRotation] = useState({ x: -15, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // AUTO ROTATION LOOP
  useEffect(() => {
    const animate = () => {
      if (!isDraggingRef.current) {
        velocityRef.current.y *= 0.99;

        if (Math.abs(velocityRef.current.y) < 0.2) {
          velocityRef.current.y = 0.25; // smooth auto spin
        }

        velocityRef.current.x *= 0.95;

        rotationRef.current.x += velocityRef.current.x;
        rotationRef.current.y += velocityRef.current.y * 1.2;

        rotationRef.current.x = Math.max(
          -40,
          Math.min(40, rotationRef.current.x)
        );

        setRotation({ ...rotationRef.current });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // POINTER DOWN
  const handlePointerDown = useCallback((e) => {
    isDraggingRef.current = true;
    setIsDragging(true);

    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };

    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  // POINTER MOVE
  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - lastPointerRef.current.x;
    const deltaY = e.clientY - lastPointerRef.current.y;

    rotationRef.current.y += deltaX * 0.5;
    rotationRef.current.x += deltaY * 0.3;

    rotationRef.current.x = Math.max(
      -40,
      Math.min(40, rotationRef.current.x)
    );

    velocityRef.current = {
      x: deltaY * 0.1,
      y: deltaX * 0.2,
    };

    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    setRotation({ ...rotationRef.current });
  }, []);

  // POINTER UP
  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // 3D Faces
  const faces = Array.from({ length: 6 }).map((_, i) => ({
    angle: (i / 6) * 360,
    index: i,
  }));

  const getGradient = (i) => {
    const g = [
      `linear-gradient(135deg, ${metalColor}33, transparent)`,
      `linear-gradient(225deg, ${metalColor}22, transparent)`,
      `linear-gradient(45deg, ${metalColor}44, transparent)`,
      `linear-gradient(315deg, ${metalColor}33, transparent)`,
      `linear-gradient(180deg, ${metalColor}22, transparent)`,
      `linear-gradient(0deg, ${metalColor}44, transparent)`,
    ];
    return g[i % g.length];
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px] relative select-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Glow Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${metalColor}20, transparent 70%)`,
        }}
      />

      {/* Perspective */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative"
          style={{
            width: "240px",
            height: "240px",
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging
              ? "none"
              : "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {/* 6 Faces */}
          {faces.map((f) => (
            <div
              key={f.index}
              className="absolute inset-0"
              style={{
                transform: `rotateY(${f.angle}deg) translateZ(120px)`,
                backfaceVisibility: "hidden",
              }}
            >
              {image && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-70"
                  style={{ backgroundImage: `url(${image})` }}
                />
              )}

              <div
                className="absolute inset-0"
                style={{ background: getGradient(f.index) }}
              />

              <div
                className="absolute inset-0"
                style={{
                  border: `1px solid ${metalColor}40`,
                  boxShadow: `inset 0 0 25px ${metalColor}15`,
                }}
              />
            </div>
          ))}

          {/* Center Shine */}
          <div
            className="absolute rounded-full"
            style={{
              width: "40px",
              height: "40px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) translateZ(130px)",
              background: `radial-gradient(circle, #fff, ${metalColor}88)`,
              boxShadow: `0 0 40px ${metalColor}66`,
            }}
          />
        </div>
      </div>

      {/* Hint */}
      <div className="absolute bottom-3 w-full text-center text-xs text-gray-400">
        Drag to rotate
      </div>
    </div>
  );
}