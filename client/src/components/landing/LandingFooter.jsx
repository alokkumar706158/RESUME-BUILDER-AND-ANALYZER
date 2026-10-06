import React from 'react';
import { Sparkles, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: 'AI Resume Builder', href: '/builder' },
      { name: 'ATS Resume Checker', href: '/analyzer' },
      { name: 'Job Description Matcher', href: '#features' },
      { name: 'Cover Letter AI', href: '#features' },
      { name: 'Bullet Point Generator', href: '#features' },
    ],
    Features: [
      { name: 'ATS Optimization', href: '#analyzer' },
      { name: 'Live Document Editor', href: '#builder' },
      { name: 'Keyword Suggestions', href: '#features' },
      { name: 'Executive Templates', href: '#features' },
      { name: 'Instant PDF Export', href: '#builder' },
    ],
    Pricing: [
      { name: 'Free Tier', href: '/builder' },
      { name: 'Pro Pass', href: '/pricing' },
      { name: 'Lifetime Access', href: '/pricing' },
      { name: 'Student Discount', href: '/pricing' },
      { name: 'Enterprise Team', href: 'mailto:contact@resumebuilder.ai' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: 'mailto:support@resumebuilder.ai' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'System Status', href: '#' },
    ]
  };

  return (
    <footer className="relative bg-[#03060d] border-t border-slate-900 text-slate-400 text-sm overflow-hidden">
      {/* Top subtle glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-14">
          {/* Brand Column */}
          <div className="col-span-2">
            <a href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Resume Builder <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI</span>
              </span>
            </a>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              AI-powered resume building, ATS optimization, and intelligent suggestions — turn your raw experience into a job-winning resume.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-slate-800 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-slate-800 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-slate-800 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-purple-300 text-xs sm:text-sm transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {currentYear} Resume Builder AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="/security" className="hover:text-slate-300 transition-colors">Security</a>
            <span className="flex items-center gap-1.5 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for ambitious builders
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
