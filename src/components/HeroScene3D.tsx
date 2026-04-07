import { useRef, useMemo, Suspense, useEffect, useState, Component, ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Torus, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/* ═══ WebGL check ═══ */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/* ═══ Silent error boundary ═══ */
class SilentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.warn("HeroScene3D error caught silently:", error.message); }
  render() { return this.state.hasError ? null : this.props.children; }
}

/* ═══ Hook: detect mobile ═══ */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

/* ═══ Mouse tracker — smooth parallax ═══ */
const mousePos = new THREE.Vector2(0, 0);
function useMouseParallax(factor = 0.3) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (ref.current) {
      ref.current.position.x += (mousePos.x * factor - ref.current.position.x) * 0.02;
      ref.current.position.y += (mousePos.y * factor - ref.current.position.y) * 0.02;
    }
  });
  return ref;
}

/* ═══ Glow ring ═══ */
function GlowRing({ radius = 0.5, color = "#2E9E6E", speed = 1 }: { radius?: number; color?: string; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.5 * speed;
      ref.current.rotation.z = state.clock.elapsedTime * 0.3 * speed;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 8, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

function Dumbbell({ position, color = "#2E9E6E", speed = 1, scale = 0.6 }: { position: [number, number, number]; color?: string; speed?: number; scale?: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.3;
      group.current.rotation.x = state.clock.elapsedTime * 0.15 * speed;
      const s = scale + Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
      group.current.scale.setScalar(s);
    }
  });
  return (
    <Float speed={1.2 * speed} rotationIntensity={0.4} floatIntensity={1.5} floatingRange={[-0.2, 0.2]}>
      <group ref={group} position={position} scale={scale}>
        <mesh><cylinderGeometry args={[0.06, 0.06, 1.6, 12]} /><meshStandardMaterial color={color} metalness={0.7} roughness={0.2} /></mesh>
        <mesh position={[0, -0.7, 0]}><cylinderGeometry args={[0.25, 0.25, 0.15, 16]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.25} /></mesh>
        <mesh position={[0, -0.85, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 16]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
        <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.25, 0.25, 0.15, 16]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.25} /></mesh>
        <mesh position={[0, 0.85, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 16]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
        <GlowRing radius={0.5} color={color} speed={speed * 0.8} />
      </group>
    </Float>
  );
}

function Football({ position, color = "#f5f5f5", speed = 1, size = 0.35 }: { position: [number, number, number]; color?: string; speed?: number; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6 * speed;
    }
  });
  return (
    <Float speed={1.5 * speed} rotationIntensity={0.6} floatIntensity={1.8} floatingRange={[-0.3, 0.3]}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} flatShading />
      </mesh>
    </Float>
  );
}

function SwimmingGoggles({ position, color = "#3B82F6", speed = 1, scale = 0.55 }: { position: [number, number, number]; color?: string; speed?: number; scale?: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.4;
      group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2 * speed) * 0.15;
    }
  });
  return (
    <Float speed={1.3 * speed} rotationIntensity={0.3} floatIntensity={1.2}>
      <group ref={group} position={position} scale={scale}>
        <mesh position={[-0.35, 0, 0]}><torusGeometry args={[0.25, 0.08, 12, 24]} /><meshStandardMaterial color={color} metalness={0.3} roughness={0.2} transparent opacity={0.8} /></mesh>
        <mesh position={[-0.35, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.2, 24]} /><meshStandardMaterial color="#87CEEB" metalness={0.5} roughness={0.1} transparent opacity={0.4} /></mesh>
        <mesh position={[0.35, 0, 0]}><torusGeometry args={[0.25, 0.08, 12, 24]} /><meshStandardMaterial color={color} metalness={0.3} roughness={0.2} transparent opacity={0.8} /></mesh>
        <mesh position={[0.35, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.2, 24]} /><meshStandardMaterial color="#87CEEB" metalness={0.5} roughness={0.1} transparent opacity={0.4} /></mesh>
        <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.18, 0.06, 0.06]} /><meshStandardMaterial color={color} metalness={0.3} roughness={0.3} /></mesh>
      </group>
    </Float>
  );
}

function TennisRacket({ position, speed = 1, scale = 0.5 }: { position: [number, number, number]; speed?: number; scale?: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 * speed) * 0.25;
      group.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
    }
  });
  return (
    <Float speed={1.1 * speed} rotationIntensity={0.5} floatIntensity={1.4}>
      <group ref={group} position={position} scale={scale}>
        <mesh position={[0, 0.5, 0]}><torusGeometry args={[0.35, 0.04, 8, 24]} /><meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.2} /></mesh>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.32, 24]} /><meshStandardMaterial color="#22c55e" transparent opacity={0.15} wireframe /></mesh>
        <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.04, 0.05, 0.6, 8]} /><meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.6} /></mesh>
        <mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.055, 0.055, 0.15, 8]} /><meshStandardMaterial color="#1a1a1a" roughness={0.8} /></mesh>
      </group>
    </Float>
  );
}

function Basketball({ position, speed = 1, size = 0.3 }: { position: [number, number, number]; speed?: number; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.35 * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.25 * speed;
    }
  });
  return (
    <Float speed={1.4 * speed} rotationIntensity={0.7} floatIntensity={2} floatingRange={[-0.25, 0.25]}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <MeshDistortMaterial color="#f97316" roughness={0.5} metalness={0.1} distort={0.08} speed={1.5} />
      </mesh>
    </Float>
  );
}

function Medal({ position, speed = 1, scale = 0.45 }: { position: [number, number, number]; speed?: number; scale?: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) { group.current.rotation.y = state.clock.elapsedTime * 0.5 * speed; }
  });
  return (
    <Float speed={1.6 * speed} rotationIntensity={0.3} floatIntensity={1.3}>
      <group ref={group} position={position} scale={scale}>
        <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.15, 0.35, 0.02]} /><meshStandardMaterial color="#ef4444" metalness={0.2} roughness={0.5} /></mesh>
        <mesh><cylinderGeometry args={[0.3, 0.3, 0.06, 24]} /><meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.15} /></mesh>
        <mesh position={[0, 0, 0.04]}><cylinderGeometry args={[0.15, 0.15, 0.02, 5]} /><meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} /></mesh>
      </group>
    </Float>
  );
}

function Whistle({ position, speed = 1, scale = 0.5 }: { position: [number, number, number]; speed?: number; scale?: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) { group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 * speed) * 0.3; }
  });
  return (
    <Float speed={1.2 * speed} rotationIntensity={0.4} floatIntensity={1.6}>
      <group ref={group} position={position} scale={scale}>
        <RoundedBox args={[0.5, 0.25, 0.2]} radius={0.06}><meshStandardMaterial color="#a3a3a3" metalness={0.7} roughness={0.2} /></RoundedBox>
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.04, 0.25, 8]} /><meshStandardMaterial color="#a3a3a3" metalness={0.7} roughness={0.2} /></mesh>
        <Torus args={[0.08, 0.02, 8, 16]} position={[0.3, 0.15, 0]}><meshStandardMaterial color="#d4d4d4" metalness={0.8} roughness={0.15} /></Torus>
      </group>
    </Float>
  );
}

function EnergyOrbit({ radius = 3, speed = 0.3, color = "#2E9E6E" }: { radius?: number; speed?: number; color?: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.y = Math.sin(t) * radius * 0.5;
      ref.current.position.z = Math.sin(t * 0.7) * 1.5;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

function Particles({ count = 50 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return pos;
  }, [count]);
  useFrame((state) => { if (mesh.current) mesh.current.rotation.y = state.clock.elapsedTime * 0.02; });
  return (
    <points ref={mesh}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.035} color="#2E9E6E" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function SparkleParticles({ count = 20 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, [count]);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      const mat = mesh.current.material as THREE.PointsMaterial;
      mat.size = 0.05 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });
  return (
    <points ref={mesh}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.05} color="#fbbf24" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function DesktopScene() {
  const parallaxGroup = useMouseParallax(0.4);
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.9} />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#66d9a0" />
      <pointLight position={[0, 0, 4]} intensity={0.3} color="#f5a623" />
      <pointLight position={[-4, 2, 2]} intensity={0.15} color="#3B82F6" />
      <group ref={parallaxGroup}>
        <Dumbbell position={[4.2, 2, -1]} color="#2E9E6E" speed={0.7} />
        <SwimmingGoggles position={[-4, 1.8, 0]} color="#3B82F6" speed={0.8} />
        <Football position={[4.8, -0.5, -0.5]} color="#f5f5f5" speed={1} size={0.35} />
        <Basketball position={[-4.5, -1.5, 0.5]} speed={0.9} size={0.3} />
        <TennisRacket position={[3.5, -2.2, -1]} speed={0.6} />
        <Medal position={[-2.5, 2.5, -1.5]} speed={1.1} />
        <Whistle position={[-3, -2.5, 0]} speed={0.7} />
        <Football position={[5.5, 1, -2]} color="#fbbf24" speed={1.3} size={0.2} />
      </group>
      <EnergyOrbit radius={4} speed={0.4} color="#2E9E6E" />
      <EnergyOrbit radius={3.5} speed={-0.3} color="#3B82F6" />
      <EnergyOrbit radius={5} speed={0.25} color="#fbbf24" />
      <Particles count={60} />
      <SparkleParticles count={25} />
    </>
  );
}

function MobileScene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 4]} intensity={0.9} />
      <directionalLight position={[-2, 2, -2]} intensity={0.25} color="#66d9a0" />

      {/* Top-right: football */}
      <Football position={[2.2, 2.5, -0.5]} color="#f5f5f5" speed={0.5} size={0.28} />
      {/* Top-left: medal */}
      <Medal position={[-2.2, 2.8, -1]} speed={0.6} scale={0.35} />
      {/* Mid-right: basketball */}
      <Basketball position={[2.5, 0.5, 0]} speed={0.4} size={0.22} />
      {/* Mid-left: tennis racket */}
      <TennisRacket position={[-2.4, 0, -0.5]} speed={0.5} scale={0.35} />
      {/* Bottom-right: dumbbell */}
      <Dumbbell position={[2, -2, -0.5]} color="#2E9E6E" speed={0.5} scale={0.35} />
      {/* Bottom-left: whistle */}
      <Whistle position={[-2, -2.5, 0]} speed={0.5} scale={0.3} />

      {/* Orbiting energy dots */}
      <EnergyOrbit radius={2.8} speed={0.3} color="#2E9E6E" />
      <EnergyOrbit radius={2.2} speed={-0.25} color="#fbbf24" />

      {/* Particles */}
      <Particles count={25} />
      <SparkleParticles count={12} />
    </>
  );
}

function MouseListener() {
  const { size } = useThree();
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mousePos.x = ((e.clientX / size.width) - 0.5) * 2;
      mousePos.y = -((e.clientY / size.height) - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [size]);
  return null;
}

export default function HeroScene3D() {
  const isMobile = useIsMobile();
  const [supported] = useState(() => isWebGLAvailable());

  if (!supported) return null;

  return (
    <div className="absolute inset-0 z-[1] w-full h-full" style={{ pointerEvents: "none" }}>
      <SilentErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, isMobile ? 6 : 7], fov: isMobile ? 60 : 42 }}
          dpr={[1, isMobile ? 1 : 1.5]}
          gl={{ antialias: !isMobile, alpha: true }}
          style={{ pointerEvents: isMobile ? "none" : "auto", width: "100%", height: "100%" }}
        >
          <Suspense fallback={null}>
            {!isMobile && <MouseListener />}
            {isMobile ? <MobileScene /> : <DesktopScene />}
          </Suspense>
        </Canvas>
      </SilentErrorBoundary>
    </div>
  );
}
