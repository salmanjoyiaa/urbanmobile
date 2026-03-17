"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroHeadline() {
  const reduceMotion = useReducedMotion();
  const skip = !!reduceMotion;

  return (
    <div className="space-y-1">
      {/* Line 1 — slide-up fade-in + soft glow pulse */}
      <motion.h1
        initial={{ opacity: skip ? 1 : 0, y: skip ? 0 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: skip ? 0 : 0.6,
          delay: skip ? 0 : 0.15,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="font-display text-[32px] sm:text-5xl lg:text-6xl font-bold text-white leading-tight animate-hero-text-glow"
      >
        Find Your
      </motion.h1>

      {/* Line 2 — slide-up + gradient shimmer */}
      <motion.div
        initial={{ opacity: skip ? 1 : 0, y: skip ? 0 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: skip ? 0 : 0.6,
          delay: skip ? 0 : 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span
          className="font-display text-[32px] sm:text-5xl lg:text-6xl font-bold leading-tight
            bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400
            bg-clip-text text-transparent
            animate-shimmer"
        >
          Perfect Rental
        </span>
      </motion.div>
    </div>
  );
}
