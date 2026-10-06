import React from 'react';
import { Star, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import TextReveal from './TextReveal';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Frontend Engineer',
    company: 'Stripe',
    salaryJump: '+42% Compensation',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    quote:
      'My resume was failing automated ATS filters for months. After using Resume Builder AI to score and rewrite my impact bullets, I got callbacks from 4 Tier-1 tech companies in two weeks.',
    rating: 5,
    metrics: '87 -> 98 ATS Score in 15 mins'
  },
  {
    name: 'David Okafor',
    role: 'Staff Product Manager',
    company: 'Google',
    salaryJump: 'L5 to L6 Transition',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    quote:
      'The job description matcher is frighteningly accurate. It highlighted three critical leadership competencies that were completely missing from my draft. Landed the principal role.',
    rating: 5,
    metrics: '3x More Recruiter Inbounds'
  },
  {
    name: 'Elena Rostova',
    role: 'Machine Learning Engineer',
    company: 'Anthropic',
    salaryJump: 'Research to Industry',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    quote:
      'Translating deep academic research into punchy achievements is tough. The AI bullet point generator nailed the STAR framework and quantifiable metrics on the first try.',
    rating: 5,
    metrics: 'Interview offer in 6 days'
  },
  {
    name: 'Marcus Vance',
    role: 'Cloud Architect & DevSecOps',
    company: 'Amazon AWS',
    salaryJump: '+35% Base Pay',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    quote:
      'The clean, ATS-compliant PDF export passed Taleo and Workday without a hitch. Recruiter told me directly that my resume format was the cleanest in the applicant pool.',
    rating: 5,
    metrics: 'Selected out of 420+ applicants'
  },
  {
    name: 'Priya Sharma',
    role: 'UX Design Lead',
    company: 'Airbnb',
    salaryJump: 'Senior to Lead Promo',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    quote:
      'Designers usually struggle with ATS parsers because we care so much about visual layout. This platform bridges aesthetic beauty with rigorous machine parsability seamlessly.',
    rating: 5,
    metrics: '100% Parsing accuracy on Greenhouse'
  },
  {
    name: 'Alex Rivera',
    role: 'Full Stack Developer',
    company: 'Shopify',
    salaryJump: 'Bootcamp to Mid-Level',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    quote:
      'I went from zero callbacks across 80 applications to 5 first-round interviews within 10 days of switching to Resume Builder AI. It paid for itself a hundred times over.',
    rating: 5,
    metrics: '5 Interviews in 10 Days'
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#050811] overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 text-purple-300 text-xs font-medium mb-5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Candidate Success Stories</span>
          </div>

          <TextReveal
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6"
          >
            Trusted by candidates hired at top global companies
          </TextReveal>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            From senior engineering roles to product leadership, see how professionals break through the ATS black box and land life-changing offers.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl bg-gradient-to-b from-[#131b2e]/90 to-[#0c1220]/90 border border-slate-800/80 p-6 sm:p-7 backdrop-blur-xl hover:border-purple-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between shadow-xl shadow-black/30"
            >
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent group-hover:via-purple-400 transition-all duration-300" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    Hired @ {t.company}
                  </span>
                </div>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 italic relative">
                  <span className="text-purple-400 font-serif text-xl mr-1 leading-none select-none">&ldquo;</span>
                  {t.quote}
                  <span className="text-purple-400 font-serif text-xl ml-1 leading-none select-none">&rdquo;</span>
                </p>
              </div>

              <div className="pt-5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700/80"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-medium text-emerald-400 block">
                    {t.metrics}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {t.salaryJump}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 rounded-2xl border border-slate-800 bg-[#0d1527]/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Join over 10,000+ job seekers securing offers</p>
              <p className="text-slate-400 text-xs">Average response rate increases by 3.8x within the first 14 days.</p>
            </div>
          </div>
          <a
            href="/builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-all shrink-0"
          >
            <span>Read 1,400+ 5-Star Reviews</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
