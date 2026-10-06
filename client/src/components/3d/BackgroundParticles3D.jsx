import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const BackgroundParticles3D = ({ count = 300 }) => {
  const pointsRef = useRef();

  // Create random 3D particle coordinates and colors
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const color1 = new THREE.Color('#8b5cf6'); // Purple
    const color2 = new THREE.Color('#38bdf8'); // Cyan
    const color3 = new THREE.Color('#6366f1'); // Indigo

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 2;

      const mixedColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = Math.sin(time * 0.02) * 0.05;
  });

  return (
    <group>
      {/* Particle Stars Field */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.75}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default BackgroundParticles3D;
