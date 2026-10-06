import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CentralResume3D from './CentralResume3D';
import FeatureCard3D from './FeatureCard3D';
import BackgroundParticles3D from './BackgroundParticles3D';

// Camera Parallax Controller
function ParallaxCamera() {
  const mouse = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.current.x * 0.8, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouse.current.y * 0.8, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export const Resume3DScene = ({
  features,
  activeSections,
  selectedFeatureId,
  onSelectFeature,
  onRemoveSection,
  onHoverFeature,
  lastAddedId
}) => {
  return (
    <>
      {/* Smooth Mouse Parallax Camera */}
      <ParallaxCamera />

      {/* Cinematic Lighting Setup */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} color="#ffffff" castShadow />
      <pointLight position={[-10, 10, 8]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[10, -10, 8]} intensity={1.5} color="#38bdf8" />
      <spotLight position={[0, 12, 12]} angle={0.4} penumbra={1} intensity={2.0} color="#a855f7" />

      {/* Background Starfield / Particle Motion */}
      <BackgroundParticles3D count={350} />

      {/* Central 3D Floating Resume */}
      <CentralResume3D
        activeSections={activeSections}
        onSectionClick={onSelectFeature}
        onRemoveSection={onRemoveSection}
        lastAddedId={lastAddedId}
      />

      {/* 9 Floating 3D Feature Objects Orbiting the Central Resume */}
      {features.map((feat) => (
        <FeatureCard3D
          key={feat.id}
          feature={feat}
          isAdded={activeSections.includes(feat.id)}
          isSelected={selectedFeatureId === feat.id}
          onSelectFeature={onSelectFeature}
          onHoverFeature={onHoverFeature}
        />
      ))}
    </>
  );
};

export default Resume3DScene;
