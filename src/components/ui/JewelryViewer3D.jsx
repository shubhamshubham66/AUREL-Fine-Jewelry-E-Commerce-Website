import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Gold ring with diamond gems - auto-rotates and supports drag
function Ring({ metalColor = '#D4AF37' }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth auto-rotation
      groupRef.current.rotation.y += 0.008;
      // Gentle floating motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  // Create gem positions around the ring
  const gemPositions = [];
  const gemCount = 16;
  for (let i = 0; i < gemCount; i++) {
    const angle = (i / gemCount) * Math.PI * 2;
    const radius = 1.0;
    gemPositions.push({
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
      scale: i % 4 === 0 ? 0.08 : 0.05, // Larger gems at cardinal points
    });
  }

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main ring band */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1, 0.18, 48, 128]} />
        <meshPhysicalMaterial
          color={metalColor}
          metalness={1.0}
          roughness={0.08}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          reflectivity={1}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Inner ring detail - slightly darker */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.02, 32, 128]} />
        <meshPhysicalMaterial
          color={metalColor}
          metalness={1.0}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Diamond gems */}
      {gemPositions.map((gem, idx) => (
        <mesh key={idx} position={gem.position} scale={gem.scale} castShadow>
          <octahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.0}
            roughness={0.0}
            transmission={0.9}
            thickness={0.5}
            ior={2.42}
            envMapIntensity={3}
            clearcoat={1}
          />
        </mesh>
      ))}

      {/* Center gem (larger, main diamond) */}
      <mesh position={[0, 1.15, 0]} scale={0.15} castShadow>
        <octahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial
          color="#f8f8ff"
          metalness={0.0}
          roughness={0.0}
          transmission={0.95}
          thickness={1}
          ior={2.42}
          envMapIntensity={4}
          clearcoat={1}
          clearcoatRoughness={0}
          attenuationColor={new THREE.Color('#ffd700')}
          attenuationDistance={0.5}
        />
      </mesh>

      {/* Prong setting for center diamond */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh
            key={`prong-${i}`}
            position={[Math.cos(rad) * 0.08, 1.05, Math.sin(rad) * 0.08]}
            scale={[0.02, 0.12, 0.02]}
          >
            <cylinderGeometry args={[1, 0.5, 1, 8]} />
            <meshPhysicalMaterial
              color={metalColor}
              metalness={1.0}
              roughness={0.05}
              envMapIntensity={2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Scene with premium lighting setup
function Scene({ metalColor }) {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.3} color="#fff8e7" />

      {/* Key light - warm gold */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        color="#fff5d4"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim light - cool accent */}
      <pointLight position={[-4, 3, -3]} intensity={0.8} color="#e0e0ff" />

      {/* Gold accent spotlight */}
      <spotLight
        position={[0, 6, 2]}
        angle={0.3}
        penumbra={0.8}
        intensity={2}
        color="#D4AF37"
        castShadow
      />

      {/* Bottom fill */}
      <pointLight position={[0, -3, 2]} intensity={0.3} color="#D4AF37" />

      {/* The ring */}
      <Ring metalColor={metalColor} />

      {/* Floor shadow */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.5}
        scale={8}
        blur={2.5}
        far={4}
        color="#000000"
      />

      {/* Orbit controls - allows drag rotation */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        rotateSpeed={0.5}
        dampingFactor={0.05}
        enableDamping
      />
    </>
  );
}

export default function JewelryViewer3D({ metalColor = '#D4AF37' }) {
  return (
    <div
      className="w-full h-full min-h-[280px] relative"
      style={{ minHeight: '280px' }}
      aria-label="Interactive 3D jewelry viewer - drag to rotate"
      role="img"
    >
      <Canvas
        camera={{ position: [0, 1, 4.5], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
        shadows
      >
        <Scene metalColor={metalColor} />
      </Canvas>

      {/* Hint text */}
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-cream/40">
          Drag to rotate
        </span>
      </div>
    </div>
  );
}
