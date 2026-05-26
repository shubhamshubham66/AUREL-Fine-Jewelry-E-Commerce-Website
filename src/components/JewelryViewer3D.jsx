import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

const MODEL_SCALE = {
  Rings: 1.12,
  Necklaces: 1.02,
  Earrings: 1.08,
  Bracelets: 1.04,
  Bangles: 1.04,
  Pendants: 1.06,
  Chains: 1.08,
  'Couple Rings': 1.08,
  'Diamond Jewelry': 1.02,
  'Gold Jewelry': 1.02,
  'Silver Jewelry': 1.06,
  'Luxury Collections': 1,
  'Wedding Collections': 1.02,
  'Bridal Jewelry': 1,
  "Men's Jewelry": 1.08,
  "Women's Jewelry": 1.08,
};

function getModelUrl(product, modelUrl, model) {
  return product?.model3D || modelUrl || model || product?.modelUrl || product?.glb || product?.gltf || "";
}

function getMetalColor(product, metalColor) {
  if (metalColor) return metalColor;

  const metal = `${product?.material || product?.metal || ""}`.toLowerCase();
  if (metal.includes("rose")) return "#B76E79";
  if (metal.includes("white") || metal.includes("silver") || metal.includes("platinum")) return "#D8DDE2";
  return "#D4AF37";
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, cacheKey: props.cacheKey };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.cacheKey !== state.cacheKey) {
      return { failed: false, cacheKey: props.cacheKey };
    }

    return null;
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function LoadingModel() {
  return (
    <div className="absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.24em] text-cream/45">
      Loading 3D model
    </div>
  );
}

function MissingModel({ product }) {
  return (
    <div className="absolute inset-0 grid place-items-center px-8 text-center text-[11px] uppercase leading-6 tracking-[0.2em] text-cream/45">
      3D model unavailable for {product?.name || "this product"}
    </div>
  );
}

function ProductModel({ product, modelUrl, metalColor }) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const materialSet = useMemo(
    () => ({
      gold: new THREE.MeshPhysicalMaterial({
        color: metalColor,
        metalness: 1,
        roughness: 0.075,
        clearcoat: 1,
        clearcoatRoughness: 0.045,
        reflectivity: 1,
        envMapIntensity: 3.8,
        iridescence: 0.08,
        sheen: 0.18,
      }),
      diamond: new THREE.MeshPhysicalMaterial({
        color: "#fbfdff",
        metalness: 0,
        roughness: 0.005,
        transmission: 0.82,
        thickness: 0.8,
        ior: 2.35,
        clearcoat: 1,
        clearcoatRoughness: 0.008,
        envMapIntensity: 4.4,
      }),
      pearl: new THREE.MeshPhysicalMaterial({
        color: "#f7efe4",
        metalness: 0,
        roughness: 0.14,
        clearcoat: 0.95,
        sheen: 1,
        envMapIntensity: 2.2,
      }),
      darkGem: new THREE.MeshPhysicalMaterial({
        color: "#080808",
        metalness: 0.15,
        roughness: 0.045,
        clearcoat: 1,
        envMapIntensity: 2.8,
      }),
    }),
    [metalColor]
  );

  useEffect(() => {
    clonedScene.traverse((node) => {
      if (!node.isMesh) return;

      node.castShadow = true;
      node.receiveShadow = true;
      const name = `${node.name} ${node.material?.name || ""}`.toLowerCase();

      if (name.includes("diamond") || name.includes("stone") || name.includes("gem")) {
        node.material = materialSet.diamond;
      } else if (name.includes("pearl")) {
        node.material = materialSet.pearl;
      } else if (name.includes("onyx") || name.includes("black")) {
        node.material = materialSet.darkGem;
      } else {
        node.material = materialSet.gold;
      }
    });
  }, [clonedScene, materialSet]);

  const scale = MODEL_SCALE[product?.category] || 1;

  return (
    <Float speed={0.95} rotationIntensity={0.035} floatIntensity={0.11}>
      <Bounds fit clip observe margin={1.08}>
        <Center position={[0, -0.02, 0]}>
          <primitive object={clonedScene} scale={scale} />
        </Center>
      </Bounds>
    </Float>
  );
}

function SceneLights({ metalColor }) {
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight position={[-3.5, 3.2, 4]} intensity={1.8} color="#fff8e8" />
      <spotLight
        position={[3.4, 4.6, 3.1]}
        angle={0.28}
        penumbra={0.82}
        intensity={6.2}
        color="#fff1c8"
        castShadow
        shadow-bias={-0.00018}
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[-4.2, 2.4, 2.8]}
        angle={0.36}
        penumbra={0.85}
        intensity={2.2}
        color="#dfe8ff"
      />
      <pointLight position={[2.8, -1.1, -2.4]} intensity={1.35} color={metalColor} />
      <pointLight position={[0, 1.8, 2.2]} intensity={0.85} color="#ffffff" />
    </>
  );
}

export default function JewelryViewer3D({
  product,
  image,
  metalColor,
  modelUrl,
  model,
}) {
  const controlsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const resolvedModel = getModelUrl(product, modelUrl, model);
  const resolvedMetal = getMetalColor(product, metalColor);
  const productKey = `${product?.id || product?.name || "jewelry"}-${resolvedModel}`;

  useEffect(() => {
    if (resolvedModel) useGLTF.preload(resolvedModel);
  }, [resolvedModel]);

  return (
    <div
      className="relative h-full min-h-[300px] w-full cursor-grab overflow-hidden select-none active:cursor-grabbing"
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerCancel={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 34%, ${resolvedMetal}42, transparent 32%), radial-gradient(circle at 50% 92%, rgba(255,255,255,0.18), transparent 34%), linear-gradient(160deg, rgba(255,255,255,0.06), transparent 42%)`,
        }}
      />

      {!resolvedModel ? (
        <MissingModel product={product} />
      ) : (
        <Suspense fallback={<LoadingModel />}>
          <Canvas
            key={productKey}
            shadows
            frameloop="always"
            dpr={[1, 1.8]}
            camera={{ position: [0, 0.2, 3.2], fov: 32, near: 0.1, far: 100 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.22,
            }}
            onCreated={({ gl }) => {
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.physicallyCorrectLights = true;
            }}
          >
            <SceneLights metalColor={resolvedMetal} />
            <Environment preset="city" background={false} blur={0.18} environmentIntensity={1.35} />

            <PresentationControls
              global={false}
              snap={{ mass: 2.4, tension: 180 }}
              speed={0.95}
              zoom={1}
              rotation={[0, 0, 0]}
              polar={[-Math.PI * 0.07, Math.PI * 0.07]}
              azimuth={[-Math.PI * 0.16, Math.PI * 0.16]}
            >
              <ModelErrorBoundary cacheKey={productKey} fallback={null}>
                <ProductModel product={product} modelUrl={resolvedModel} metalColor={resolvedMetal} />
              </ModelErrorBoundary>
            </PresentationControls>

            <ContactShadows
              position={[0, -1.18, 0]}
              opacity={0.42}
              scale={4.2}
              blur={2.65}
              far={2.8}
              color="#000000"
            />

            <OrbitControls
              ref={controlsRef}
              makeDefault
              autoRotate={!isDragging}
              autoRotateSpeed={0.8}
              enableDamping
              dampingFactor={0.08}
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI * 0.37}
              maxPolarAngle={Math.PI * 0.63}
              rotateSpeed={0.9}
              touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
              onStart={() => setIsDragging(true)}
              onEnd={() => setIsDragging(false)}
            />
          </Canvas>
        </Suspense>
      )}

      {image && (
        <img src={image} alt="" className="sr-only" draggable={false} aria-hidden="true" />
      )}
      <div className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] uppercase tracking-[0.28em] text-cream/35">
        Drag to rotate
      </div>
    </div>
  );
}
