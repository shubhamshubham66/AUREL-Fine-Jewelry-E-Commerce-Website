import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   DIAMOND GEOMETRY - Brilliant Cut
───────────────────────────────────────────── */
function DiamondMesh({ position = [0, 0.52, 0], scale = 0.32 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.6, 0.85, 8, 1);
    // Flip cone to make diamond crown
    geo.scale(1, -1, 1);
    geo.translate(0, 0.42, 0);

    // Merge with top pavilion
    const topGeo = new THREE.CylinderGeometry(0.6, 0.75, 0.3, 8, 1);
    topGeo.translate(0, 0.85, 0);

    const mergedGeo = new THREE.BufferGeometry();

    // Combine both geometries
    const positions1 = geo.attributes.position.array;
    const positions2 = topGeo.attributes.position.array;
    const combined = new Float32Array(positions1.length + positions2.length);
    combined.set(positions1);
    combined.set(positions2, positions1.length);

    const normals1 = geo.attributes.normal.array;
    const normals2 = topGeo.attributes.normal.array;
    const combinedNormals = new Float32Array(normals1.length + normals2.length);
    combinedNormals.set(normals1);
    combinedNormals.set(normals2, normals1.length);

    mergedGeo.setAttribute("position", new THREE.BufferAttribute(combined, 3));
    mergedGeo.setAttribute(
      "normal",
      new THREE.BufferAttribute(combinedNormals, 3)
    );

    // Build index
    const idx1 = geo.index ? Array.from(geo.index.array) : [];
    const idx2 = topGeo.index
      ? Array.from(topGeo.index.array).map(
          (i) => i + positions1.length / 3
        )
      : [];
    mergedGeo.setIndex([...idx1, ...idx2]);

    geo.dispose();
    topGeo.dispose();

    return mergedGeo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} scale={scale}>
      <MeshTransmissionMaterial
        backside
        samples={8}
        thickness={0.4}
        chromaticAberration={0.3}
        anisotropy={0.2}
        distortion={0.1}
        distortionScale={0.2}
        temporalDistortion={0.1}
        iridescence={1.5}
        iridescenceIOR={1.5}
        iridescenceThicknessRange={[100, 400]}
        clearcoat={1}
        attenuationDistance={0.5}
        attenuationColor="#ffffff"
        color="#ffffff"
        transmission={0.95}
        roughness={0.0}
        ior={2.42}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   RING BAND - Torus Geometry
───────────────────────────────────────────── */
function RingBand({ metalType = "gold" }) {
  const ringRef = useRef();

  const materialProps = useMemo(() => {
    if (metalType === "gold") {
      return {
        color: new THREE.Color("#D4AF37"),
        metalness: 1.0,
        roughness: 0.15,
        envMapIntensity: 2.5,
      };
    }
    return {
      color: new THREE.Color("#C0C0C0"),
      metalness: 1.0,
      roughness: 0.1,
      envMapIntensity: 3.0,
    };
  }, [metalType]);

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <torusGeometry args={[0.7, 0.08, 32, 100]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   PRONG SETTING - Holds the diamond
───────────────────────────────────────────── */
function Prongs({ metalType = "gold", count = 6 }) {
  const color = metalType === "gold" ? "#D4AF37" : "#C0C0C0";

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * 0.12;
        const z = Math.sin(angle) * 0.12;
        return (
          <mesh key={i} position={[x, 0.28, z]}>
            <cylinderGeometry args={[0.012, 0.008, 0.35, 8]} />
            <meshStandardMaterial
              color={color}
              metalness={1}
              roughness={0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─────────────────────────────────────────────
   SPARKLE PARTICLES - Floating light particles
───────────────────────────────────────────── */
function Sparkles() {
  const particlesRef = useRef();
  const count = 40;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const posArray = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        posArray[i * 3 + 1] +=
          Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.0008;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ─────────────────────────────────────────────
   COMPLETE RING GROUP - With float animation
───────────────────────────────────────────── */
function DiamondRing({ metalType = "gold" }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth floating animation
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
      // Gentle rotation
      groupRef.current.rotation.y += 0.004;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        <RingBand metalType={metalType} />
        <Prongs metalType={metalType} />
        <DiamondMesh />
        <Sparkles />
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────
   SCENE LIGHTING - Cinematic studio setup
───────────────────────────────────────────── */
function SceneLighting() {
  return (
    <>
      {/* Key Light */}
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* Fill Light */}
      <spotLight
        position={[-5, 3, -5]}
        angle={0.4}
        penumbra={1}
        intensity={1}
        color="#f0e6ff"
      />
      {/* Rim Light */}
      <pointLight position={[0, -2, 4]} intensity={0.8} color="#ffd700" />
      {/* Ambient */}
      <ambientLight intensity={0.3} />
    </>
  );
}

/* ─────────────────────────────────────────────
   METAL SWITCH BUTTON
───────────────────────────────────────────── */
function MetalButton({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-5 py-2.5 rounded-full text-xs font-medium uppercase tracking-widest
        transition-all duration-500 ease-out cursor-pointer
        ${
          active
            ? "text-white shadow-lg scale-105"
            : "text-gray-400 hover:text-white hover:scale-105"
        }
      `}
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}cc, ${color}66)`
          : "rgba(255,255,255,0.05)",
        border: active
          ? `1px solid ${color}88`
          : "1px solid rgba(255,255,255,0.1)",
        boxShadow: active ? `0 4px 20px ${color}44` : "none",
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   LOADING FALLBACK
───────────────────────────────────────────── */
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-xs tracking-widest uppercase">
          Loading 3D View
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT EXPORT
───────────────────────────────────────────── */
export default function JewelryViewer3D({ metalColor = "#D4AF37", image }) {
  // Determine metal type from hex color
  const getMetalTypeFromColor = (hex) => {
    if (!hex) return "gold";
    const lower = hex.toLowerCase();
    if (lower.includes("c0c0c0") || lower.includes("silver") || lower.includes("e8e8e8")) {
      return "silver";
    }
    return "gold";
  };

  const [metalType, setMetalType] = useState(getMetalTypeFromColor(metalColor));

  return (
    <div className="relative w-full h-full min-h-[450px] select-none overflow-hidden rounded-2xl">
      {/* Premium Dark Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 50%, #000000 100%)",
        }}
      />

      {/* Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            metalType === "gold"
              ? "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%)"
              : "radial-gradient(circle at 50% 50%, rgba(192,192,192,0.08) 0%, transparent 60%)",
          transition: "background 1s ease",
        }}
      />

      {/* 3D Canvas */}
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0.5, 3.5], fov: 40 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
          className="absolute inset-0"
        >
          <SceneLighting />

          <DiamondRing metalType={metalType} />

          {/* Contact Shadow */}
          <ContactShadows
            position={[0, -0.85, 0]}
            opacity={0.5}
            scale={4}
            blur={2.5}
            far={1.5}
            color={metalType === "gold" ? "#D4AF37" : "#888888"}
          />

          {/* Environment for reflections */}
          <Environment preset="studio" />

          {/* Orbit Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.8}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
            dampingFactor={0.05}
            enableDamping
          />
        </Canvas>
      </Suspense>

      {/* Metal Switch Buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        <MetalButton
          active={metalType === "gold"}
          onClick={() => setMetalType("gold")}
          label="Gold"
          color="#D4AF37"
        />
        <MetalButton
          active={metalType === "silver"}
          onClick={() => setMetalType("silver")}
          label="Silver"
          color="#C0C0C0"
        />
      </div>

      {/* Subtle hint */}
      <div className="absolute top-4 right-4 text-gray-500 text-[10px] tracking-wider uppercase opacity-60 z-10">
        Drag to explore
      </div>
    </div>
  );
}
