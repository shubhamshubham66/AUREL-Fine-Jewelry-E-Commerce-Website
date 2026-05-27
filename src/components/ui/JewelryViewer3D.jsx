import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import * as THREE from 'three';
import { model as modelUrl } from '../../utils/assets.js';

/* ───────────────────────────────────────────────────────────────
   PROCEDURAL DIAMOND (used by every category fallback)
─────────────────────────────────────────────────────────────── */
function DiamondMesh({ position = [0, 0, 0], scale = 0.32 }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });

  // Combine a cone (pavilion) with a small cylinder (girdle) once.
  const geometry = useMemo(() => {
    const pavilion = new THREE.ConeGeometry(0.6, 0.85, 8, 1);
    pavilion.scale(1, -1, 1);
    pavilion.translate(0, 0.42, 0);

    const crown = new THREE.CylinderGeometry(0.6, 0.75, 0.3, 8, 1);
    crown.translate(0, 0.85, 0);

    const merged = new THREE.BufferGeometry();
    const p1 = pavilion.attributes.position.array;
    const p2 = crown.attributes.position.array;
    const positions = new Float32Array(p1.length + p2.length);
    positions.set(p1);
    positions.set(p2, p1.length);

    const n1 = pavilion.attributes.normal.array;
    const n2 = crown.attributes.normal.array;
    const normals = new Float32Array(n1.length + n2.length);
    normals.set(n1);
    normals.set(n2, n1.length);

    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    const i1 = pavilion.index ? Array.from(pavilion.index.array) : [];
    const i2 = crown.index
      ? Array.from(crown.index.array).map((i) => i + p1.length / 3)
      : [];
    merged.setIndex([...i1, ...i2]);

    pavilion.dispose();
    crown.dispose();
    return merged;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} scale={scale}>
      <MeshTransmissionMaterial
        backside
        samples={6}
        thickness={0.4}
        chromaticAberration={0.3}
        anisotropy={0.2}
        distortion={0.08}
        distortionScale={0.2}
        temporalDistortion={0.05}
        iridescence={1.2}
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

/* ───────────────────────────────────────────────────────────────
   CATEGORY-SPECIFIC PROCEDURAL FALLBACKS
─────────────────────────────────────────────────────────────── */
function ProceduralRing({ metalHex }) {
  return (
    <group>
      {/* Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.08, 32, 100]} />
        <meshStandardMaterial
          color={metalHex}
          metalness={1}
          roughness={0.15}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Six prongs holding the diamond */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 0.12;
        const z = Math.sin(angle) * 0.12;
        return (
          <mesh key={i} position={[x, 0.28, z]}>
            <cylinderGeometry args={[0.012, 0.008, 0.35, 8]} />
            <meshStandardMaterial
              color={metalHex}
              metalness={1}
              roughness={0.15}
            />
          </mesh>
        );
      })}

      {/* Centre stone */}
      <DiamondMesh position={[0, 0.52, 0]} scale={0.32} />
    </group>
  );
}

function ProceduralNecklace({ metalHex }) {
  return (
    <group>
      {/* Chain arc — open half-torus along the top */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
        <torusGeometry args={[0.95, 0.025, 16, 80, Math.PI]} />
        <meshStandardMaterial
          color={metalHex}
          metalness={1}
          roughness={0.18}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Bail */}
      <mesh position={[0, -0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.018, 12, 32]} />
        <meshStandardMaterial color={metalHex} metalness={1} roughness={0.15} />
      </mesh>

      {/* Pendant diamond */}
      <DiamondMesh position={[0, -0.65, 0]} scale={0.4} />
    </group>
  );
}

function ProceduralEarring({ metalHex }) {
  const buildOne = (xOffset) => (
    <group position={[xOffset, 0, 0]}>
      {/* Ear hook */}
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 12, 32]} />
        <meshStandardMaterial color={metalHex} metalness={1} roughness={0.15} />
      </mesh>
      {/* Drop wire */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color={metalHex} metalness={1} roughness={0.15} />
      </mesh>
      {/* Stone */}
      <DiamondMesh position={[0, -0.15, 0]} scale={0.3} />
    </group>
  );

  return (
    <group>
      {buildOne(-0.45)}
      {buildOne(0.45)}
    </group>
  );
}

function ProceduralBracelet({ metalHex }) {
  return (
    <group rotation={[0.35, 0, 0]}>
      {/* Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.06, 32, 100]} />
        <meshStandardMaterial
          color={metalHex}
          metalness={1}
          roughness={0.15}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Eight diamonds spaced evenly around the band */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 0.9;
        const z = Math.sin(angle) * 0.9;
        return <DiamondMesh key={i} position={[x, 0, z]} scale={0.16} />;
      })}
    </group>
  );
}

function ProceduralModel({ category, metalHex }) {
  switch (category) {
    case 'Necklaces':
      return <ProceduralNecklace metalHex={metalHex} />;
    case 'Earrings':
      return <ProceduralEarring metalHex={metalHex} />;
    case 'Bracelets':
      return <ProceduralBracelet metalHex={metalHex} />;
    case 'Rings':
    default:
      return <ProceduralRing metalHex={metalHex} />;
  }
}

/* ───────────────────────────────────────────────────────────────
   .GLB LOADER (auto-centred and auto-scaled)
─────────────────────────────────────────────────────────────── */
function GLTFModel({ url, metalHex }) {
  const { scene } = useGLTF(url);

  const fitted = useMemo(() => {
    const clone = scene.clone(true);

    // If a metal color was provided, gently tint metal-looking materials
    // so the same .glb can render in gold / rose / silver.
    clone.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if ('metalness' in m && m.metalness > 0.5 && metalHex) {
            m.color = new THREE.Color(metalHex);
          }
        });
      }
    });

    // Centre and uniform-scale to fit roughly within ±0.9 units
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fitScale = 1.6 / maxDim;
    clone.scale.setScalar(fitScale);

    return clone;
  }, [scene, metalHex]);

  return <primitive object={fitted} />;
}

/* ───────────────────────────────────────────────────────────────
   ERROR BOUNDARY — falls back to procedural if .glb load fails
─────────────────────────────────────────────────────────────── */
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    // Silent fallback — log once for the developer.
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(
        '[JewelryViewer3D] .glb model failed to load; rendering procedural fallback.',
        err && err.message ? err.message : err
      );
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

function Model({ glbUrl, category, metalHex }) {
  const procedural = <ProceduralModel category={category} metalHex={metalHex} />;

  if (!glbUrl) return procedural;

  // key={glbUrl} ensures the boundary resets when switching products
  return (
    <ModelErrorBoundary key={glbUrl} fallback={procedural}>
      <Suspense fallback={procedural}>
        <GLTFModel url={glbUrl} metalHex={metalHex} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

/* ───────────────────────────────────────────────────────────────
   FLOATING WRAPPER + AUTO-ROTATION
─────────────────────────────────────────────────────────────── */
function FloatingModel({ glbUrl, category, metalHex }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={groupRef}>
        <Model glbUrl={glbUrl} category={category} metalHex={metalHex} />
      </group>
    </Float>
  );
}

/* ───────────────────────────────────────────────────────────────
   CINEMATIC LIGHTING
─────────────────────────────────────────────────────────────── */
function SceneLighting() {
  return (
    <>
      {/* Key light */}
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* Fill */}
      <spotLight
        position={[-5, 3, -5]}
        angle={0.4}
        penumbra={1}
        intensity={1}
        color="#f0e6ff"
      />
      {/* Warm rim */}
      <pointLight position={[0, -2, 4]} intensity={0.8} color="#ffd700" />
      {/* Ambient base */}
      <ambientLight intensity={0.3} />
    </>
  );
}

/* ───────────────────────────────────────────────────────────────
   UI ATOMS
─────────────────────────────────────────────────────────────── */
function MetalButton({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      className="relative px-5 py-2 rounded-full text-[11px] font-medium uppercase tracking-widest transition-all duration-500 ease-out cursor-pointer"
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}cc, ${color}66)`
          : 'rgba(255,255,255,0.05)',
        border: active
          ? `1px solid ${color}aa`
          : '1px solid rgba(255,255,255,0.1)',
        color: active ? '#fff' : '#9ca3af',
        boxShadow: active ? `0 4px 20px ${color}55` : 'none',
        transform: active ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {label}
    </button>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase">
          Preparing 3D View
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   MAIN EXPORT
─────────────────────────────────────────────────────────────── */
export default function JewelryViewer3D({
  metalColor = '#D4AF37',
  category = 'Rings',
  modelPath = null, // filename inside /public/models/, e.g. "ring.glb"
  // image prop kept for backwards compatibility — not currently used inside the canvas
  // but remains a valid prop to avoid breaking ProductViewModal callers.
  // eslint-disable-next-line no-unused-vars
  image = null,
}) {
  // Resolve the .glb URL with the proper GitHub Pages base prefix.
  const glbUrl = useMemo(() => (modelPath ? modelUrl(modelPath) : null), [modelPath]);

  // Internal "metal" toggle (Gold / Silver) — initialised from metalColor prop.
  const inferMetal = (hex) => {
    if (!hex) return 'gold';
    const lower = hex.toLowerCase();
    if (
      lower.includes('c0c0c0') ||
      lower.includes('d9d9d9') ||
      lower.includes('e8e8e8') ||
      lower.includes('silver')
    ) {
      return 'silver';
    }
    return 'gold';
  };

  const [metalType, setMetalType] = useState(() => inferMetal(metalColor));

  // Sync internal toggle when parent changes the metalColor prop.
  useEffect(() => {
    setMetalType(inferMetal(metalColor));
  }, [metalColor]);

  const activeHex = metalType === 'gold' ? '#D4AF37' : '#C0C0C0';

  return (
    <div className="relative w-full h-full min-h-[400px] select-none overflow-hidden rounded-2xl">
      {/* Premium dark background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 50%, #000000 100%)',
        }}
      />

      {/* Soft metal-tinted glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            metalType === 'gold'
              ? 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.10) 0%, transparent 60%)'
              : 'radial-gradient(circle at 50% 50%, rgba(192,192,192,0.10) 0%, transparent 60%)',
          transition: 'background 1s ease',
        }}
      />

      {/* 3D scene */}
      <Suspense fallback={<LoadingOverlay />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0.5, 3.6], fov: 40 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
          className="absolute inset-0"
        >
          <SceneLighting />

          <FloatingModel
            glbUrl={glbUrl}
            category={category}
            metalHex={activeHex}
          />

          <ContactShadows
            position={[0, -0.85, 0]}
            opacity={0.5}
            scale={4}
            blur={2.5}
            far={1.5}
            color={metalType === 'gold' ? '#D4AF37' : '#888888'}
          />

          {/* HDRI-style studio environment for realistic metallic reflections */}
          <Environment preset="studio" />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.8}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
            enableDamping
            dampingFactor={0.06}
            // Touch support: rotate with one finger, no pinch zoom
            touches={{ ONE: 0 /* ROTATE */ }}
          />
        </Canvas>
      </Suspense>

      {/* Metal toggle */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        <MetalButton
          active={metalType === 'gold'}
          onClick={() => setMetalType('gold')}
          label="Gold"
          color="#D4AF37"
        />
        <MetalButton
          active={metalType === 'silver'}
          onClick={() => setMetalType('silver')}
          label="Silver"
          color="#C0C0C0"
        />
      </div>

      {/* Subtle drag hint */}
      <div className="absolute top-4 right-4 text-[10px] tracking-[0.25em] uppercase text-gray-400/70 z-10 pointer-events-none">
        Drag · 360°
      </div>
    </div>
  );
}
