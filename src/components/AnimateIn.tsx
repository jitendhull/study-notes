'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimateIn({ children, className, delay = 0 }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animation = animate(element, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 260,
      delay,
      ease: 'out(2)',
    });

    return () => {
      animation.revert();
    };
  }, [delay]);

  return <div ref={elementRef} className={className}>{children}</div>;
}
