import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Splash.css';

const Splash = ({ onComplete }) => {
  const splashRef = useRef(null);
  const logoNameRef = useRef(null);
  const subNameRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      // 1. Text animations (staggered with the SVG CSS animations)
      tl.fromTo(
        logoNameRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 2, delay: 1.2, ease: "power2.out" }
      );

      tl.to(subNameRef.current, {
        opacity: 1,
        duration: 1.2,
        delay: -1.4, // Overlap with logo name
        ease: "power2.out",
      });

      // 2. Fade out the whole splash screen
      tl.to(splashRef.current, {
        opacity: 0,
        duration: 1.5,
        delay: 1.5, // Let the drawing finish and text settle
        ease: "power2.inOut",
      });
    }, splashRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div className="loading-page" ref={splashRef}>
      <div className="logo-svg-wrap">
        <svg viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg">
          {/* Papaya fruit shape */}
          <path className="stroke-path orange draw-1"
            d="M60,30 C55,10 90,5 110,15 C135,25 150,50 145,80
               C140,110 120,130 100,138 C80,146 55,138 45,118
               C35,98 40,65 55,48 C58,44 60,38 60,30 Z"/>

          {/* Papaya leaves */}
          <path className="stroke-path green draw-2"
            d="M108,18 C115,5 138,2 148,12
               C155,20 150,35 140,38 C130,41 115,32 108,18 Z"/>
          <path className="stroke-path green draw-2"
            d="M118,22 C128,12 148,14 152,26
               C155,34 145,44 135,42 C125,40 116,32 118,22 Z"/>

          {/* Leaf tip */}
          <path className="stroke-path green draw-3"
            d="M148,12 C158,6 165,10 162,18 C160,24 152,24 148,18"/>

          {/* Letter P */}
          <path className="stroke-path draw-3"
            d="M22,90 L22,125
               M22,90 L32,90 C40,90 44,95 44,101
               C44,107 40,112 32,112 L22,112"/>

          {/* Letter a */}
          <path className="stroke-path draw-3"
            d="M50,100 C50,95 55,93 60,93
               C65,93 68,96 68,101 L68,112
               M50,105 C50,110 54,113 60,113
               C65,113 68,110 68,107"/>

          {/* Letter p */}
          <path className="stroke-path draw-4"
            d="M75,93 L75,120
               M75,97 C75,94 78,93 82,93
               C88,93 92,97 92,103
               C92,109 88,113 82,113
               C78,113 75,111 75,108"/>

          {/* Letter a */}
          <path className="stroke-path draw-4"
            d="M98,100 C98,95 103,93 108,93
               C113,93 116,96 116,101 L116,112
               M98,105 C98,110 102,113 108,113
               C113,113 116,110 116,107"/>

          {/* Letter y */}
          <path className="stroke-path draw-4"
            d="M122,93 L130,108
               M138,93 L130,108 L127,118"/>

          {/* Letter a */}
          <path className="stroke-path draw-4"
            d="M145,100 C145,95 150,93 155,93
               C160,93 163,96 163,101 L163,112
               M145,105 C145,110 149,113 155,113
               C160,113 163,110 163,107"/>

          {/* Decorative dots */}
          <circle className="stroke-path green draw-4" cx="40"  cy="130" r="1.5"/>
          <circle className="stroke-path green draw-4" cx="95"  cy="130" r="1.5"/>
          <circle className="stroke-path orange draw-4" cx="150" cy="130" r="1.5"/>
        </svg>
      </div>

      <div className="name-container">
        <div className="logo-name" ref={logoNameRef}>papaya academy</div>
      </div>
      <div className="sub-name" ref={subNameRef}>a kalinga project</div>
    </div>
  );
};

export default Splash;
