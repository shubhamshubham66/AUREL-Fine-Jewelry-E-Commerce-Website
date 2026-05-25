import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

function Ring({ metalColor = '#D4AF37' }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const gemPositions = [];
  const gemCount = 12;
  for (let i = 0; i < gemCount; i++) {
    const angle = (i / gemCount) * Math.PI * 2;
    gemPositions.push([Math.cos(angle) * 1.0, Math.sin(angle) * 1.0, 0]);
  }

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.15, 32, 100]} />
        <meshStandardMaterial
          color={metalColor}
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>
      {gemPositions.map((pos, idx) => (
        <mesh key={idx} position={pos} scale={0.06}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.1}
            roughness={0.0}
            transparent
            opacity={0.9}
            envMapIntensity={3}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ metalColor }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#fff8e7" />
      <spotLight
        position={[-3, 5, 2]}
        angle={0.4}
        penumbra={0.5}
        intensity={1.5}
        color="#D4AF37"
        castShadow
      />
      <Ring metalColor={metalColor} />
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={5}
        blur={2}
        far={4}
      />
      <Environment preset="studio" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={false}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}

export default function JewelryViewer3D({ metalColor = '#D4AF37' }) {
  return (
    <div className="w-full h-full relative" aria-label="3D jewelry viewer">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene metalColor={metalColor} />
      </Canvas>
    </div>
  );
}
