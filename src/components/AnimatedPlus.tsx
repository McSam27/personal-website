import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLE_COUNT = 8;
const CYCLE_DURATION = 4000; // ms between disassemble cycles

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / PARTICLE_COUNT) * i + (Math.random() * 30 - 15),
    distance: 18 + Math.random() * 14,
    size: 2 + Math.random() * 2,
    delay: Math.random() * 0.15,
  }));
}

export default function AnimatedPlus() {
  const [exploded, setExploded] = useState(false);
  const [particles] = useState(generateParticles);

  useEffect(() => {
    const interval = setInterval(() => {
      setExploded(true);
      setTimeout(() => setExploded(false), 800);
    }, CYCLE_DURATION);

    // First trigger after a short delay
    const initial = setTimeout(() => {
      setExploded(true);
      setTimeout(() => setExploded(false), 800);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, []);

  return (
    <span
      className="inline-flex items-center justify-center relative"
      style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle' }}
    >
      {/* Plus icon made of two bars */}
      <motion.svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        className="absolute"
        animate={{
          rotate: exploded ? 180 : 0,
          scale: exploded ? 0 : 1,
        }}
        transition={{
          rotate: { duration: 0.4, ease: 'easeInOut' },
          scale: { duration: 0.3, ease: 'easeIn', delay: exploded ? 0.1 : 0.3 },
        }}
      >
        {/* Horizontal bar */}
        <motion.rect
          x="4"
          y="10.5"
          width="16"
          height="3"
          rx="1.5"
          fill="var(--accent-orange)"
        />
        {/* Vertical bar */}
        <motion.rect
          x="10.5"
          y="4"
          width="3"
          height="16"
          rx="1.5"
          fill="var(--accent-orange)"
        />
      </motion.svg>

      {/* Particles */}
      <AnimatePresence>
        {exploded &&
          particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance;
            const ty = Math.sin(rad) * p.distance;
            return (
              <motion.span
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: 'var(--accent-orange)',
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: tx,
                  y: ty,
                  opacity: 0,
                  scale: 0.3,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                  delay: p.delay,
                }}
              />
            );
          })}
      </AnimatePresence>
    </span>
  );
}
