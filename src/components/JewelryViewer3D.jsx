// Premium Lenskart-style 3D product viewer.
// Features: HDR environment, PBR materials, continuous 360 auto-rotate
// with pause-on-interact + auto-resume, smooth fade/scale transition between
// products, and a modern gold spinner during model load.

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Time after the last user interaction before auto-rotate resumes.
const RESUME_DELAY_MS = 1800;
// Continuous rotation speed (radians/second). Slow + premium feel.
const AUTO_ROTATE_SPEED = 0.35;

// Map the chosen metal swatch to a hex used by the PBR material.
function resolveMetalColor(product, metalColor) {
  if (metalColor) return metalColor;
  const metal = `${product?.material || product?.metal || ''}`.toLowerCase();
  if (metal.includes('rose')) return '#B76E79';
  if (metal.includes('white') || metal.includes('platinum') || metal.includes('silver')) return '#D8DDE2';
  return '#D4AF37';
}

function resolveModelUrl(product, modelUrl, model) {
  return (
    product?.model3D ||
    product?.model ||
    modelUrl ||
    model ||
    product?.modelUrl ||
    ''
  );
}

// Boundary that swallows model-loading errors and resets when the model changes.
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, cacheKey: props.cacheKey };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.cacheKey !== state.cacheKey) return { failed: false, cacheKey: props.cacheKey };
    return null;
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// Modern in-canvas spinner shown while the .glb is downloading + parsing.
function CanvasSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-cream/70">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-gold/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold border-r-gold/60" />
          <div className="absolute inset-2 rounded-full bg-gold/10 blur-sm" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-cream/50">
          Loading 3D
        </p>
      </div>
    </Html>
  );
}

// A self-contained pivot that auto-rotates the model and respects a "paused" flag.
function AutoRotateGroup({ children, paused, onMount }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && onMount) onMount(ref.current);
  }, [onMount]);

  useFrame((_, delta) => {
    if (!ref.current || paused) return;
    // Smooth, frame-rate independent.
    ref.current.rotation.y += AUTO_ROTATE_SPEED * delta;
  });

  return <group ref={ref}>{children}</group>;
}

// Loads a .glb, clones the scene, and applies physically-correct materials
// (high metalness for gold, glassy diamond, soft pearl, dark gem).
function ProductModel({ product, modelUrl, metalColor }) {
  const { scene } = useGLTF(modelUrl);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const materials = useMemo(
    () => ({
      gold: new THREE.MeshPhysicalMaterial({
        color: metalColor,
        metalness: 1,
        roughness: 0.085,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        reflectivity: 1,
        envMapIntensity: 3.6,
        sheen: 0.18,
        sheenColor: new THREE.Color('#fff4d2'),
      }),
      diamond: new THREE.MeshPhysicalMaterial({
        color: '#fbfdff',
        metalness: 0,
        roughness: 0.005,
        transmission: 0.85,
        thickness: 0.8,
        ior: 2.41,
        clearcoat: 1,
        clearcoatRoughness: 0.005,
        envMapIntensity: 4.2,
        attenuationDistance: 1.2,
      }),
      pearl: new THREE.MeshPhysicalMaterial({
        color: '#f7efe4',
        metalness: 0,
        roughness: 0.16,
        clearcoat: 0.95,
        sheen: 1,
        sheenColor: new THREE.Color('#fff'),
        envMapIntensity: 2.1,
      }),
      darkGem: new THREE.MeshPhysicalMaterial({
        color: '#0a0a0a',
        metalness: 0.18,
        roughness: 0.05,
        clearcoat: 1,
        envMapIntensity: 2.8,
      }),
    }),
    [metalColor]
  );

  useEffect(() => {
    cloned.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const tag = `${node.name} ${node.material?.name || ''}`.toLowerCase();
      if (tag.includes('diamond') || tag.includes('stone') || tag.includes('gem') || tag.includes('crystal')) {
        node.material = materials.diamond;
      } else if (tag.includes('pearl')) {
        node.material = materials.pearl;
      } else if (tag.includes('onyx') || tag.includes('black')) {
        node.material = materials.darkGem;
      } else {
        node.material = materials.gold;
      }
    });
  }, [cloned, materials]);

  return (
    <Bounds fit clip observe margin={1.1}>
      <Center>
        <primitive object={cloned} />
      </Center>
    </Bounds>
  );
}

// Three-point lighting + warm gold rim. The HDR map handles reflections.
function SceneLights({ metalColor }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3.2, 4.6, 3.1]}
        intensity={2.4}
        color="#fff1c8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-4.2, 2.4, 2.8]} intensity={0.9} color="#dfe8ff" />
      <pointLight position={[0, -1.5, 2.2]} intensity={0.6} color={metalColor} />
    </>
  );
}

export default function JewelryViewer3D({
  product,
  metalColor,
  modelUrl,
  model,
  className = '',
}) {
  const resolvedModel = resolveModelUrl(product, modelUrl, model);
  const resolvedMetal = resolveMetalColor(product, metalColor);
  const cacheKey = `${product?.id || product?.slug || product?.name || 'item'}-${resolvedModel}`;

  // Pause auto-rotate when the user is interacting; auto-resume after delay.
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef(null);

  const pauseAndScheduleResume = () => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), RESUME_DELAY_MS);
  };

  useEffect(() => () => resumeTimer.current && clearTimeout(resumeTimer.current), []);

  // Pre-warm the next .glb in the background.
  useEffect(() => {
    if (resolvedModel) useGLTF.preload(resolvedModel);
  }, [resolvedModel]);

  return (
    <div className={`relative h-full w-full overflow-hidden select-none ${className}`}>
      {/* Soft radial backdrop tinted with the chosen metal */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${resolvedMetal}33, transparent 36%), radial-gradient(circle at 50% 92%, rgba(255,255,255,0.15), transparent 38%), linear-gradient(160deg, rgba(255,255,255,0.05), transparent 44%)`,
        }}
      />

      {!resolvedModel ? (
        <div className="absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.24em] text-cream/45">
          3D model unavailable
        </div>
      ) : (
        // Fade + scale transition between product models.
        <AnimatePresence mode="wait">
          <motion.div
            key={cacheKey}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Canvas
              shadows
              dpr={[1, 1.8]}
              frameloop="always"
              camera={{ position: [0, 0.25, 3.2], fov: 32, near: 0.1, far: 100 }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2,
              }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
            >
              <SceneLights metalColor={resolvedMetal} />

              {/* HDR environment map for realistic reflections (Drei built-in studio HDR) */}
              <Environment preset="studio" background={false} environmentIntensity={1.4} />

              <Suspense fallback={<CanvasSpinner />}>
                <ModelErrorBoundary cacheKey={cacheKey} fallback={null}>
                  <AutoRotateGroup paused={paused}>
                    <ProductModel
                      product={product}
                      modelUrl={resolvedModel}
                      metalColor={resolvedMetal}
                    />
                  </AutoRotateGroup>
                </ModelErrorBoundary>
              </Suspense>

              <ContactShadows
                position={[0, -1.18, 0]}
                opacity={0.45}
                scale={4.5}
                blur={2.6}
                far={2.8}
                color="#000000"
              />

              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.08}
                enablePan={false}
                enableZoom
                minDistance={2.2}
                maxDistance={5.5}
                minPolarAngle={Math.PI * 0.32}
                maxPolarAngle={Math.PI * 0.66}
                rotateSpeed={0.85}
                zoomSpeed={0.55}
                touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
                onStart={pauseAndScheduleResume}
                onEnd={pauseAndScheduleResume}
              />
            </Canvas>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-[0.32em] text-cream/35">
        Drag · Zoom · 360°
      </div>
    </div>
  );
}
