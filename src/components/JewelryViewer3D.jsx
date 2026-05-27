// Premium Lenskart-style 3D product viewer.
//
// Pure GLB pipeline — every product loads its real .glb model from
// /public via useGLTF, the cloned scene is auto-centred and auto-fit
// inside Bounds, and the same cinematic studio HDR + PBR material
// override applies across all products. No image planes, no procedural
// primitives — only real 3D meshes.
//
// The 3D animation system is preserved exactly:
//   - Canvas: shadows, dpr [1,1.8], frameloop="always", ACES tone-map
//   - Camera: position [0, 0.25, 3.2], fov 32, near 0.1, far 100
//   - Lighting: SceneLights (key + fill + warm rim + ambient) plus
//     <Environment preset="studio"> for HDR reflections
//   - Auto-rotation: AUTO_ROTATE_SPEED rad/s on a self-contained group,
//     pause-on-interact and auto-resume after RESUME_DELAY_MS
//   - OrbitControls: damped, no pan, drag to rotate, wheel/pinch to
//     zoom, polar tilt limits, touch dolly+pan
//   - ContactShadows under every model
//
// Behaviour preserved across product switches: smooth fade+scale via
// AnimatePresence + framer-motion, keyed off the cache key.

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
import { asset } from '../utils/assets.js';

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

// Resolve the GLB URL with the correct GitHub Pages base prefix.
// External (https://...) URLs are passed through untouched.
function resolveModelUrl(product, modelUrl, model) {
  const raw =
    product?.model3D ||
    product?.model ||
    modelUrl ||
    model ||
    product?.modelUrl ||
    '';
  return asset(raw);
}

// Boundary that swallows model-loading errors (404, malformed GLB, etc.)
// and resets when the model URL changes so a different product still gets
// a fresh attempt.
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

  componentDidCatch(err) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[JewelryViewer3D] failed to load .glb', err && err.message ? err.message : err);
    }
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
function AutoRotateGroup({ children, paused }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current || paused) return;
    // Smooth, frame-rate independent.
    ref.current.rotation.y += AUTO_ROTATE_SPEED * delta;
  });

  return <group ref={ref}>{children}</group>;
}

// Loads a real .glb, clones the scene (so multiple instances don't share
// state), and applies physically-correct PBR materials (high metalness
// for gold, glassy diamond, soft pearl, dark gem).
//
// Material override is name-based — meshes / materials whose name
// contains 'diamond' / 'stone' / 'gem' / 'crystal' get the glassy
// transmission shader, 'pearl' gets sheen, 'onyx' / 'black' gets the
// dark gem shader, everything else gets the metal shader. This keeps
// the viewer flexible: any GLB you drop in renders correctly as long
// as the meshes are sensibly named.
function ProductModel({ modelUrl, metalColor }) {
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

  // Bounds + Center auto-fit any GLB regardless of its native scale or
  // origin offset, so a 1mm-scale ring and a 10cm-scale necklace both
  // sit nicely inside the camera frustum.
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
  // image prop kept for backwards compatibility — passed in by some
  // call-sites but no longer rendered (we always show the real GLB).
  // eslint-disable-next-line no-unused-vars
  image,
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

  // Pre-warm the next .glb in the background so switching between
  // products is instant — drei caches the parsed scene per URL.
  useEffect(() => {
    if (!resolvedModel) return;
    try { useGLTF.preload(resolvedModel); } catch { /* ignore */ }
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
        // Fade + scale transition between products.
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

              {/* HDR studio environment for realistic metallic reflections.
                  This is what gives gold its glow and diamonds their fire. */}
              <Environment preset="studio" background={false} environmentIntensity={1.4} />

              <Suspense fallback={<CanvasSpinner />}>
                <ModelErrorBoundary cacheKey={cacheKey} fallback={null}>
                  <AutoRotateGroup paused={paused}>
                    <ProductModel modelUrl={resolvedModel} metalColor={resolvedMetal} />
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
