import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useState } from "react";
import ModelLoader from "./ModelLoader";

function PlaceholderPCB() {
  return (
    <mesh rotation={[-0.15, 0.4, 0]}>
      <boxGeometry args={[3, 0.15, 2]} />
      <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
    </mesh>
  );
}

export default function ModelViewer({
  modelPath,
  gerberFiles,
  className = "",
  interactive = true,
  autoRotate = false,
  autoRotateSpeed = 0.8,
  minDistance = 2,
  maxDistance = 20,
}) {
  // Build a stable identity key from model + gerber paths so React
  // fully unmounts / remounts ModelLoader when switching modules.
  // This guarantees zero stale texture bleed between boards.
  const instanceKey = modelPath + "|" + (gerberFiles?.join(",") ?? "");
  const [loaded, setLoaded] = useState(false);
  const hasModel = Boolean(modelPath);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} className={className}>
      {hasModel && !loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none bg-gray-900/60">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
          <p className="mt-3 text-xs text-gray-500">Loading model…</p>
        </div>
      )}

      <Canvas camera={{ position: [0, 4, 6], fov: 40 }} style={{ background: '#111827' }}>
        <color attach="background" args={['#111827']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-4, 3, -4]} intensity={0.4} />

        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.25}
          scale={15}
          blur={2}
          far={5}
        />

        <Suspense fallback={<PlaceholderPCB />}>
          {hasModel ? (
            <ModelLoader key={instanceKey} path={modelPath} gerberFiles={gerberFiles} onLoad={() => setLoaded(true)} />
          ) : (
            <PlaceholderPCB />
          )}
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={interactive}
          enableZoom={interactive}
          enableRotate={interactive}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          minDistance={minDistance}
          maxDistance={maxDistance}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
