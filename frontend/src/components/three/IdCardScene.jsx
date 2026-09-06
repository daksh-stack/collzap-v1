import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Budget notes: two rounded boxes, a tube, a plane and a torus.
 * Well under 200k tris, no environment map, no postprocessing.
 */
export default function IdCardScene({ onDegrade }) {
  const [visible, setVisible] = useState(() => !document.hidden);

  // Pause the loop entirely when the tab is backgrounded.
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <Canvas
      frameloop={visible ? 'always' : 'never'}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.15, 4.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onDegrade?.();
        });
      }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      // No OrbitControls: the user does not drive this object.
    >
      <FpsWatch onDegrade={onDegrade} />

      {/* Warm key + cool fill. Paper-ish, no HDR environment. */}
      <ambientLight intensity={0.85} color="#F4EFE6" />
      <directionalLight position={[2.5, 3, 2.5]} intensity={1.5} color="#FFE7D0" />
      <directionalLight position={[-3, -1, 1]} intensity={0.35} color="#BFCBD6" />

      <Lanyard />
    </Canvas>
  );
}

/** Drops to the CSS card if the scene sustains a bad frame rate. */
function FpsWatch({ onDegrade }) {
  const acc = useRef({ t: 0, frames: 0, bad: 0, warmup: 0 });

  useFrame((_, delta) => {
    const a = acc.current;

    // Ignore the first couple of seconds: shader compile and chunk parse
    // always produce a bad sample that says nothing about steady state.
    a.warmup += delta;
    if (a.warmup < 2) return;

    a.t += delta;
    a.frames += 1;
    if (a.t < 1) return;

    const fps = a.frames / a.t;
    a.t = 0;
    a.frames = 0;

    // Only bail on sustained badness — three consecutive poor seconds.
    // This is an idle background object; it does not need 60fps to be fine.
    if (fps < 15) {
      a.bad += 1;
      if (a.bad >= 3) onDegrade?.();
    } else {
      a.bad = 0;
    }
  });

  return null;
}

function Lanyard() {
  const group = useRef();
  const card = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      // Slow idle sway, as if hanging.
      group.current.rotation.z = Math.sin(t * 0.42) * 0.055;
      group.current.position.y = Math.sin(t * 0.7) * 0.045;
    }
    if (card.current) {
      // Slow idle rotation — the card turns to show its face and back.
      card.current.rotation.y = Math.sin(t * 0.3) * 0.85;
      card.current.rotation.x = Math.sin(t * 0.5) * 0.06;
    }
  });

  // Two straps meeting at the clip, so it reads as a loop around a neck
  // rather than a single stick. Ends land exactly on the ring at y=1.0.
  const strapLeft = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.95, 3.4, -0.1),
    new THREE.Vector3(-0.6, 2.4, 0),
    new THREE.Vector3(-0.22, 1.6, 0.02),
    new THREE.Vector3(-0.02, 0.90, 0),
  ]), []);

  const strapRight = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.95, 3.4, -0.1),
    new THREE.Vector3(0.6, 2.4, 0),
    new THREE.Vector3(0.22, 1.6, 0.02),
    new THREE.Vector3(0.02, 0.90, 0),
  ]), []);

  return (
    <group ref={group} position={[0, -0.35, 0]}>
      {/* lanyard: two straps meeting at the clip */}
      <mesh>
        <tubeGeometry args={[strapLeft, 28, 0.042, 6, false]} />
        <meshStandardMaterial color="#8A3510" roughness={0.85} />
      </mesh>
      <mesh>
        <tubeGeometry args={[strapRight, 28, 0.042, 6, false]} />
        <meshStandardMaterial color="#8A3510" roughness={0.85} />
      </mesh>

      {/* clip ring, threaded through the card's punch hole (card y 0.36 + hole 0.44) */}
      <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.016, 8, 20]} />
        <meshStandardMaterial color="#9A948C" roughness={0.4} metalness={0.7} />
      </mesh>

      <group ref={card} position={[0, 0.36, 0]}>
        {/* card body — plastic, slightly glossy */}
        <RoundedBox args={[1.62, 1.06, 0.028]} radius={0.05} smoothness={3}>
          <meshStandardMaterial color="#FBF8F2" roughness={0.42} metalness={0.02} />
        </RoundedBox>

        {/* punch hole */}
        <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.012, 6, 16]} />
          <meshStandardMaterial color="#DDD4C8" roughness={0.8} />
        </mesh>

        {/* accent band across the bottom */}
        <mesh position={[0, -0.38, 0.016]}>
          <planeGeometry args={[1.62, 0.19]} />
          <meshStandardMaterial color="#C45C26" roughness={0.6} />
        </mesh>

        {/* photo panel */}
        <mesh position={[-0.48, 0.06, 0.016]}>
          <planeGeometry args={[0.44, 0.56]} />
          <meshStandardMaterial color="#F5DECD" roughness={0.7} />
        </mesh>

        {/* name lines */}
        <mesh position={[0.22, 0.19, 0.016]}>
          <planeGeometry args={[0.66, 0.055]} />
          <meshStandardMaterial color="#1A1714" roughness={0.9} opacity={0.72} transparent />
        </mesh>
        <mesh position={[0.12, 0.07, 0.016]}>
          <planeGeometry args={[0.46, 0.042]} />
          <meshStandardMaterial color="#6B645C" roughness={0.9} opacity={0.6} transparent />
        </mesh>
      </group>
    </group>
  );
}
