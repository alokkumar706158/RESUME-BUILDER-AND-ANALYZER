import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const FeatureCard3D = ({
  feature,
  isAdded,
  isSelected,
  onSelectFeature,
  onHoverFeature
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Target positions & rotations
  // Default orbit position
  const orbitPos = new THREE.Vector3(...feature.orbitPosition);
  const orbitRot = new THREE.Euler(...feature.orbitRotation);

  // Added/Center target position (flies into center resume)
  const centerPos = new THREE.Vector3(0, 0, 0.2);
  const centerRot = new THREE.Euler(0, 0, 0);

  // Current interpolated values
  const currentPos = useRef(new THREE.Vector3(...feature.orbitPosition));
  const currentRot = useRef(new THREE.Euler(...feature.orbitRotation));
  const currentScale = useRef(1);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const floatOffset = Math.sin(time * 1.8 + feature.id.length) * 0.12;

    let targetPos = orbitPos.clone();
    let targetRot = orbitRot.clone();
    let targetScale = 1;

    if (isAdded) {
      // Feature has flown into the central resume!
      targetPos = centerPos.clone();
      targetRot = centerRot.clone();
      targetScale = 0.001; // Shrinks down as it absorbs into the resume
    } else if (hovered) {
      // Hovered state: object moves forward towards camera (+Z), rotates slightly towards viewer, glows
      targetPos.z += 0.6;
      targetPos.y += 0.1;
      targetRot.x += 0.08;
      targetRot.y += 0.15;
      targetScale = 1.15;
    } else {
      // Idle orbiting state with gentle floating sine oscillation
      targetPos.y += floatOffset;
      targetRot.y += Math.sin(time * 0.8) * 0.05;
    }

    // Smooth spring lerp for position, rotation, scale
    const lerpSpeed = isAdded ? 6 : 4;
    currentPos.current.lerp(targetPos, delta * lerpSpeed);
    meshRef.current.position.copy(currentPos.current);

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRot.x, delta * lerpSpeed);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRot.y, delta * lerpSpeed);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRot.z, delta * lerpSpeed);

    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, delta * lerpSpeed);
    meshRef.current.scale.setScalar(currentScale.current);
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (onHoverFeature) onHoverFeature(feature.id);
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (onHoverFeature) onHoverFeature(null);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelectFeature(feature.id);
  };

  if (isAdded && currentScale.current < 0.05) {
    // Hide mesh once absorbed to save render power
    return null;
  }

  return (
    <group
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      cursor="pointer"
    >
      {/* 3D Glass Mesh Box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.0, 0.12]} />
        <meshPhysicalMaterial
          color={hovered ? feature.colorHover : (isAdded ? '#8b5cf6' : feature.colorBg)}
          roughness={0.15}
          metalness={0.2}
          transmission={0.6}
          thickness={0.5}
          transparent={true}
          opacity={hovered ? 0.95 : 0.8}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          emissive={hovered ? feature.colorGlow : '#000000'}
          emissiveIntensity={hovered ? 0.6 : 0.05}
        />
      </mesh>

      {/* Outer Glow Wireframe Accent */}
      <mesh scale={[1.04, 1.04, 1.04]}>
        <boxGeometry args={[1.6, 1.0, 0.12]} />
        <meshBasicMaterial
          color={hovered ? feature.accentColor : (isAdded ? '#a855f7' : '#334155')}
          wireframe={true}
          transparent={true}
          opacity={hovered ? 0.8 : 0.25}
        />
      </mesh>

      {/* HTML Label & Icon Content mapped directly onto 3D Object */}
      <Html
        transform
        distanceFactor={4.5}
        position={[0, 0, 0.08]}
        className="pointer-events-none select-none"
      >
        <div
          className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 w-44 ${
            hovered
              ? 'bg-slate-900/90 border-cyan-400/80 shadow-[0_0_25px_rgba(56,189,248,0.5)] text-white scale-105'
              : isAdded
              ? 'bg-purple-950/80 border-purple-500/80 text-purple-200'
              : 'bg-slate-950/80 border-slate-700/80 text-slate-200'
          }`}
        >
          <div
            className={`p-2 rounded-lg text-lg flex items-center justify-center ${
              hovered ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
            }`}
          >
            {feature.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold tracking-wide leading-tight truncate">
              {feature.title}
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {isAdded ? 'Active on Resume' : 'Click to Add'}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default FeatureCard3D;
