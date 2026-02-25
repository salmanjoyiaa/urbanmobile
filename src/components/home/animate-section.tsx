"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

const defaultVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type AnimateSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
};

/**
 * Wraps content and animates it into view on scroll.
 * Respects prefers-reduced-motion.
 */
export function AnimateSection({
  children,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.15,
}: AnimateSectionProps) {
  const reduceMotion = useReducedMotion();
  const effectiveDuration = reduceMotion ? 0 : duration;
  const effectiveVariants = reduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : defaultVariants;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={effectiveVariants}
      transition={{
        duration: effectiveDuration,
        delay: reduceMotion ? 0 : delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type AnimateStaggerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  amount?: number;
};

/**
 * Container that staggers its direct children when the container enters view.
 */
export function AnimateStagger({
  children,
  className,
  staggerDelay = 0.08,
  once = true,
  amount = 0.1,
}: AnimateStaggerProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduceMotion ? 0 : staggerDelay,
            delayChildren: reduceMotion ? 0 : 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type AnimateItemProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Single item to be used inside AnimateStagger.
 */
export function AnimateItem({ children, className }: AnimateItemProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
