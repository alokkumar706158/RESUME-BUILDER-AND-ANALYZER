import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const TextReveal = ({
  children,
  className = '',
  as: Component = 'div',
  start = 'top 85%',
  end = 'bottom 45%',
  initialOpacity = 0.18
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Respect user reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    let split;
    let anim;

    try {
      // Split text into characters and words
      split = new SplitType(el, { types: 'words,chars', tagName: 'span' });

      if (split.chars && split.chars.length > 0) {
        gsap.set(split.chars, {
          opacity: initialOpacity,
          willChange: 'opacity'
        });

        anim = gsap.to(split.chars, {
          opacity: 1,
          stagger: 0.03,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      }
    } catch (err) {
      console.warn('TextReveal split error:', err);
    }

    return () => {
      if (anim && anim.scrollTrigger) {
        anim.scrollTrigger.kill();
      }
      if (anim) {
        anim.kill();
      }
      if (split) {
        split.revert();
      }
    };
  }, [children, start, end, initialOpacity]);

  return (
    <Component ref={textRef} className={`text-reveal-block ${className}`}>
      {children}
    </Component>
  );
};

export default TextReveal;
