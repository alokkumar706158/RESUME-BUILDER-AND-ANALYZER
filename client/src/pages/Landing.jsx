import React, { Suspense, lazy } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import ProblemSection from '../components/landing/ProblemSection';
import BuilderMockupSection from '../components/landing/BuilderMockupSection';
import AnalyzerSection from '../components/landing/AnalyzerSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import BeforeAfterSection from '../components/landing/BeforeAfterSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FinalCTASection from '../components/landing/FinalCTASection';
import LandingFooter from '../components/landing/LandingFooter';

const InteractiveResumeExperience = lazy(() => import('../components/3d/InteractiveResumeExperience'));

class ErrorBoundary3D extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn('3D Canvas fallback activated:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans antialiased selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      {/* 1. Sticky Glassmorphic Navbar */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Trusted / Stats Section */}
        <StatsSection />

        {/* 3.5 Interactive 3D Resume Builder Experience */}
        <ErrorBoundary3D>
          <Suspense fallback={
            <div className="w-full h-[300px] bg-[#050814] flex items-center justify-center text-slate-400 text-sm">
              Loading 3D Experience...
            </div>
          }>
            <InteractiveResumeExperience />
          </Suspense>
        </ErrorBoundary3D>

        {/* 4. Problem Statement & Pain Points with Text Reveal */}
        <ProblemSection />

        {/* 5. Interactive AI Resume Builder Mockup */}
        <BuilderMockupSection />

        {/* 6. AI Resume Analyzer & ATS Score Dashboard */}
        <AnalyzerSection />

        {/* 7. Comprehensive AI Features Grid */}
        <FeaturesSection />

        {/* 8. How It Works (3 Steps) */}
        <HowItWorksSection />

        {/* 9. Interactive Before vs After Comparison */}
        <BeforeAfterSection />

        {/* 10. Testimonials & Social Proof */}
        <TestimonialsSection />

        {/* 11. Final High-Impact CTA */}
        <FinalCTASection />
      </main>

      {/* 12. Modern SaaS Footer */}
      <LandingFooter />
    </div>
  );
}
