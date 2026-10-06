import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const CentralResume3D = ({
  activeSections,
  onSectionClick,
  onRemoveSection,
  lastAddedId
}) => {
  const meshRef = useRef();
  const pulseRef = useRef();
  const [pulseScale, setPulseScale] = useState(0);
  const [pulseOpacity, setPulseOpacity] = useState(0);

  // Trigger glowing shockwave pulse whenever a new feature is added
  useEffect(() => {
    if (lastAddedId) {
      setPulseScale(1);
      setPulseOpacity(0.9);
    }
  }, [lastAddedId]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    // Subtle float & tilt
    meshRef.current.position.y = Math.sin(time * 1.5) * 0.08;
    meshRef.current.rotation.z = Math.sin(time * 0.8) * 0.015;
    meshRef.current.rotation.y = Math.cos(time * 0.6) * 0.02;

    // Shockwave pulse decay animation
    if (pulseOpacity > 0.01) {
      setPulseScale((prev) => prev + delta * 3.5);
      setPulseOpacity((prev) => Math.max(0, prev - delta * 1.8));
    }
  });

  const hasSection = (id) => activeSections.includes(id);

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Shockwave Glow Ring on Absorption */}
      {pulseOpacity > 0.01 && (
        <mesh position={[0, 0, -0.05]} scale={[pulseScale, pulseScale, 1]}>
          <ringGeometry args={[2.2, 2.5, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent={true}
            opacity={pulseOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Main Central 3D Paper/Glass Slab */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.2, 5.6, 0.16]} />
        <meshPhysicalMaterial
          color="#0b1329"
          roughness={0.2}
          metalness={0.3}
          transmission={0.4}
          thickness={0.8}
          transparent={true}
          opacity={0.94}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          emissive="#1e1b4b"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Outer Holographic Glow Edge Border */}
      <mesh scale={[1.015, 1.015, 1.015]}>
        <boxGeometry args={[4.2, 5.6, 0.16]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe={true}
          transparent={true}
          opacity={0.4}
        />
      </mesh>

      {/* Futuristic Floating HTML Document Rendered Over 3D Mesh */}
      <Html
        transform
        distanceFactor={4.8}
        position={[0, 0, 0.09]}
        className="pointer-events-auto select-none"
      >
        <div className="w-[360px] min-h-[500px] max-h-[520px] bg-[#070d1e]/95 border border-indigo-500/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(99,102,241,0.25)] text-slate-100 backdrop-blur-xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
          
          {/* Top Document Header */}
          <div>
            {/* Header / Profile Section */}
            <div
              onClick={() => onSectionClick('profile')}
              className={`p-3 rounded-xl border transition cursor-pointer relative group ${
                hasSection('profile')
                  ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 shadow-md'
                  : 'bg-slate-950/40 border-dashed border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                    <span>ALEXANDER R. VANCE</span>
                    {hasSection('profile') && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
                    )}
                  </h3>
                  <p className="text-[11px] font-semibold text-cyan-400">
                    Lead AI Architect & Systems Engineer
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>San Francisco, CA</div>
                  <div>alex@vance-ai.dev</div>
                </div>
              </div>

              {!hasSection('profile') && (
                <div className="text-[10px] text-slate-500 mt-1 italic">
                  + Click to add / customize Profile details
                </div>
              )}

              {hasSection('profile') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSection('profile');
                  }}
                  className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/60 opacity-0 group-hover:opacity-100 transition"
                  title="Remove feature"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ATS Score Header Indicator */}
            {hasSection('ats') && (
              <div
                onClick={() => onSectionClick('ats')}
                className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/40 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎯</span>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      ATS Optimization Score
                    </div>
                    <div className="text-xs text-slate-300 font-medium">98/100 Top Tier Compatible</div>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/50">
                  98%
                </span>
              </div>
            )}

            {/* AI Summary Section */}
            {hasSection('ai-summary') && (
              <div
                onClick={() => onSectionClick('ai-summary')}
                className="mt-2.5 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 cursor-pointer transition relative group"
              >
                <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider flex items-center justify-between mb-1">
                  <span>✨ AI Executive Summary</span>
                  <span className="text-[9px] text-purple-400 bg-purple-900/50 px-1.5 py-0.5 rounded">Tailored</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  High-impact AI Systems Leader with 6+ years designing distributed LLM infrastructure, real-time vector search pipelines, and enterprise SaaS platforms.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSection('ai-summary');
                  }}
                  className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/60 opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Dynamic Active Sections List */}
            <div className="space-y-2 mt-2.5">
              {/* Skills */}
              {hasSection('skills') && (
                <div
                  onClick={() => onSectionClick('skills')}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition relative group"
                >
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>⚡ Core Technical Skills</span>
                    <span className="text-slate-500 font-normal">Edit</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['React 19', 'TypeScript', 'Node.js', 'Python', 'PyTorch', 'PostgreSQL', 'Docker', 'AWS'].map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-[9px] font-medium border border-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection('skills');
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/60 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Experience */}
              {hasSection('experience') && (
                <div
                  onClick={() => onSectionClick('experience')}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition relative group"
                >
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 flex justify-between">
                    <span>💼 Work Experience</span>
                    <span className="text-slate-400 font-normal text-[9px]">2021 — Present</span>
                  </div>
                  <div className="text-xs font-bold text-white">Principal AI Engineer • Vercel Partner Labs</div>
                  <ul className="text-[10px] text-slate-300 list-disc list-inside mt-1 space-y-0.5">
                    <li>Architected real-time streaming AI pipeline handling 5M daily queries.</li>
                    <li>Reduced build latency by 45% using Rust & TypeScript microservices.</li>
                  </ul>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection('experience');
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/60 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Projects */}
              {hasSection('projects') && (
                <div
                  onClick={() => onSectionClick('projects')}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition relative group"
                >
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    🚀 Key Projects
                  </div>
                  <div className="text-xs font-semibold text-white">VectorStream AI • Open Source Engine</div>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    High-throughput similarity search backend supporting 10M vectors with 5ms p99 latency.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection('projects');
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/60 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Education */}
              {hasSection('education') && (
                <div
                  onClick={() => onSectionClick('education')}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition relative group"
                >
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
                    🎓 Education
                  </div>
                  <div className="text-xs font-semibold text-white">B.S. in Computer Science & AI</div>
                  <div className="text-[10px] text-slate-400">Stanford University • Magna Cum Laude</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection('education');
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/60 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Certifications */}
              {hasSection('certifications') && (
                <div
                  onClick={() => onSectionClick('certifications')}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition relative group"
                >
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                    🏆 Certifications
                  </div>
                  <div className="text-[11px] text-slate-200">
                    AWS Solutions Architect Professional • Certified Kubernetes Administrator (CKA)
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection('certifications');
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/60 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Achievements */}
              {hasSection('achievements') && (
                <div
                  onClick={() => onSectionClick('achievements')}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition relative group"
                >
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">
                    ⭐ Honors & Achievements
                  </div>
                  <div className="text-[11px] text-slate-200">
                    1st Place Global AI Innovation Hackathon 2025 • Published 2 ACM Research Papers
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection('achievements');
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/60 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Status bar */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="font-semibold text-slate-300">{activeSections.length} / 9 Features Active</span>
            </span>
            <span className="text-cyan-400 font-semibold hover:underline cursor-pointer">
              Interactive 3D Engine
            </span>
          </div>

        </div>
      </Html>
    </group>
  );
};

export default CentralResume3D;
