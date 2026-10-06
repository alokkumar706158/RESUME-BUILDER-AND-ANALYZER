import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Code2,
  Briefcase,
  GraduationCap,
  Rocket,
  Award,
  Trophy,
  User,
  Target,
  Bot
} from 'lucide-react';
import Resume3DScene from './Resume3DScene';
import SectionEditorDrawer from './SectionEditorDrawer';

// 9 Required Feature Definitions with 3D Orbit Coordinates & Styling
const FEATURE_OBJECTS = [
  {
    id: 'profile',
    title: 'Profile',
    icon: <User className="w-5 h-5" />,
    description: 'Personal details, title, contact links, and verified identity badges.',
    orbitPosition: [0, 3.5, 0.4],
    orbitRotation: [-0.1, 0, 0],
    colorBg: '#0f172a',
    colorHover: '#1e293b',
    colorGlow: '#38bdf8',
    accentColor: '#38bdf8'
  },
  {
    id: 'ai-summary',
    title: 'AI Summary',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    description: 'Generative AI summary tailored to job descriptions with keyword optimization.',
    orbitPosition: [-3.8, 2.3, 0.3],
    orbitRotation: [0.1, 0.25, -0.05],
    colorBg: '#2e1065',
    colorHover: '#3b0764',
    colorGlow: '#a855f7',
    accentColor: '#c084fc'
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: <Code2 className="w-5 h-5 text-cyan-400" />,
    description: 'Categorized technical & soft skills matrix with proficiency matching.',
    orbitPosition: [-4.2, 0.6, 0.5],
    orbitRotation: [0.05, 0.3, 0],
    colorBg: '#083344',
    colorHover: '#164e63',
    colorGlow: '#06b6d4',
    accentColor: '#22d3ee'
  },
  {
    id: 'experience',
    title: 'Experience',
    icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
    description: 'Detailed work history with high-impact STAR bullet points & metrics.',
    orbitPosition: [-4.2, -1.0, 0.4],
    orbitRotation: [-0.05, 0.3, 0.05],
    colorBg: '#1e1b4b',
    colorHover: '#312e81',
    colorGlow: '#6366f1',
    accentColor: '#818cf8'
  },
  {
    id: 'education',
    title: 'Education',
    icon: <GraduationCap className="w-5 h-5 text-blue-400" />,
    description: 'Degrees, academic honors, GPA, and relevant computer science coursework.',
    orbitPosition: [-3.6, -2.6, 0.3],
    orbitRotation: [-0.1, 0.2, 0.08],
    colorBg: '#172554',
    colorHover: '#1e3a8a',
    colorGlow: '#3b82f6',
    accentColor: '#60a5fa'
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: <Rocket className="w-5 h-5 text-amber-400" />,
    description: 'Featured production apps, open-source repos, vector engines, and live demos.',
    orbitPosition: [3.8, 2.3, 0.3],
    orbitRotation: [0.1, -0.25, 0.05],
    colorBg: '#451a03',
    colorHover: '#78350f',
    colorGlow: '#f59e0b',
    accentColor: '#fbbf24'
  },
  {
    id: 'certifications',
    title: 'Certifications',
    icon: <Award className="w-5 h-5 text-emerald-400" />,
    description: 'AWS, Cloud Architect, Kubernetes (CKA), and AI certifications with badges.',
    orbitPosition: [4.2, 0.6, 0.5],
    orbitRotation: [0.05, -0.3, 0],
    colorBg: '#064e3b',
    colorHover: '#047857',
    colorGlow: '#10b981',
    accentColor: '#34d399'
  },
  {
    id: 'achievements',
    title: 'Achievements',
    icon: <Trophy className="w-5 h-5 text-rose-400" />,
    description: 'Hackathon victories, industry awards, publications, and top rankings.',
    orbitPosition: [4.2, -1.0, 0.4],
    orbitRotation: [-0.05, -0.3, -0.05],
    colorBg: '#4c0519',
    colorHover: '#881337',
    colorGlow: '#f43f5e',
    accentColor: '#fb7185'
  },
  {
    id: 'ats',
    title: 'ATS Optimization',
    icon: <Target className="w-5 h-5 text-emerald-400" />,
    description: 'Real-time recruiter ATS scanner, single-page margin budget & keyword check.',
    orbitPosition: [3.6, -2.6, 0.3],
    orbitRotation: [-0.1, -0.2, -0.08],
    colorBg: '#022c22',
    colorHover: '#065f46',
    colorGlow: '#059669',
    accentColor: '#10b981'
  }
];

export const InteractiveResumeExperience = () => {
  const navigate = useNavigate();
  // Start with a default set of active features visible on the 3D resume
  const [activeSections, setActiveSections] = useState([
    'profile',
    'skills',
    'experience',
    'ai-summary',
    'ats'
  ]);
  const [selectedFeatureId, setSelectedFeatureId] = useState(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);

  // Toggle or add section via click
  const handleSelectFeature = useCallback((featureId) => {
    setActiveSections((prev) => {
      if (prev.includes(featureId)) {
        // Already added -> open section editor drawer
        setSelectedFeatureId(featureId);
        return prev;
      } else {
        // Not added -> animate into central resume!
        setLastAddedId(featureId);
        return [...prev, featureId];
      }
    });
  }, []);

  // Remove section (triggers reverse fly-to-orbit animation)
  const handleRemoveSection = useCallback((featureId) => {
    setActiveSections((prev) => prev.filter((id) => id !== featureId));
    if (selectedFeatureId === featureId) {
      setSelectedFeatureId(null);
    }
  }, [selectedFeatureId]);

  const handleReset = () => {
    setActiveSections(['profile', 'skills', 'experience']);
    setSelectedFeatureId(null);
  };

  const handleAddAll = () => {
    setActiveSections(FEATURE_OBJECTS.map((f) => f.id));
  };

  const selectedFeature = FEATURE_OBJECTS.find((f) => f.id === selectedFeatureId);

  return (
    <section className="relative w-full h-[880px] bg-[#050814] overflow-hidden border-y border-slate-800/80 select-none">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-tr from-purple-900/30 via-indigo-900/20 to-cyan-900/25 rounded-full blur-[160px] pointer-events-none" />

      {/* Top HUD Floating Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
              <span>3D Interactive Resume Engine</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                v3.0 Live
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Click floating 3D objects to animate & attach them into the central resume.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-2xl shadow-xl backdrop-blur-xl">
          <button
            onClick={handleAddAll}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Add All</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
          <button
            onClick={() => navigate('/builder')}
            className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 rounded-xl shadow-md transition flex items-center space-x-1.5 hover:scale-105"
          >
            <span>Launch Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 0, 9.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Resume3DScene
            features={FEATURE_OBJECTS}
            activeSections={activeSections}
            selectedFeatureId={selectedFeatureId}
            onSelectFeature={handleSelectFeature}
            onRemoveSection={handleRemoveSection}
            onHoverFeature={setHoveredFeatureId}
            lastAddedId={lastAddedId}
          />
        </Canvas>
      </div>

      {/* Bottom Floating Feature Selector Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 pointer-events-auto">
        <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 whitespace-nowrap hidden md:block">
            3D Features:
          </div>

          <div className="flex items-center space-x-2">
            {FEATURE_OBJECTS.map((feat) => {
              const isAdded = activeSections.includes(feat.id);
              const isHovered = hoveredFeatureId === feat.id;
              return (
                <button
                  key={feat.id}
                  onClick={() => handleSelectFeature(feat.id)}
                  onMouseEnter={() => setHoveredFeatureId(feat.id)}
                  onMouseLeave={() => setHoveredFeatureId(null)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    isAdded
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/60 shadow-lg shadow-purple-950/50'
                      : isHovered
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-400/60 scale-105'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{feat.icon}</span>
                  <span>{feat.title}</span>
                  {isAdded && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Modal/Drawer when an active section is clicked */}
      <SectionEditorDrawer
        feature={selectedFeature}
        isOpen={Boolean(selectedFeatureId)}
        onClose={() => setSelectedFeatureId(null)}
        onRemoveFeature={handleRemoveSection}
      />
    </section>
  );
};

export default InteractiveResumeExperience;
