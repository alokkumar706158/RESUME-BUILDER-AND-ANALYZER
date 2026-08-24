import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ATSGauge = ({ score, label = 'ATS Score' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(score, 10) || 0;
    if (end === 0) {
      setAnimatedScore(0);
      return;
    }

    const duration = 1000; // ms
    const increment = end / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const radius = 45;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getColor = (val) => {
    if (val < 50) return { text: 'text-rose-500', stroke: '#F43F5E' };
    if (val < 75) return { text: 'text-amber-500', stroke: '#F59E0B' };
    return { text: 'text-emerald-500', stroke: '#10B981' };
  };

  const colors = getColor(animatedScore);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold tracking-tight ${colors.text}`}>
            {animatedScore}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default ATSGauge;
