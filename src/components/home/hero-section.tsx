"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = (delay = 0, reduceMotion?: boolean) => ({
  initial: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
});

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-hero-light pt-4 pb-16 lg:pt-6 lg:pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5 lg:px-12">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-4">

        {/* Left: Text — white on dark gradient (light theme); dark mode unchanged */}
        <div className="w-full lg:w-[48%] z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div {...fadeUp(0, reduceMotion ?? false)} className="inline-flex items-center gap-2 rounded-full bg-white/15 dark:bg-accent/10 backdrop-blur-sm px-4 py-1.5 border border-white/25 dark:border-border mb-6 shadow-sm">
            <span className="text-[11px] lg:text-[12px] font-black text-white dark:text-accent/90 tracking-[0.15em] uppercase">
              Trusted by 500+ tenants across KSA
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1, reduceMotion ?? false)}
            className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[60px] xl:text-[64px] font-black tracking-[-0.04em] leading-[1.05] mb-5 text-white dark:text-foreground"
          >
            Your Next<br />
            Home,{" "}
            <span className="text-white font-semibold pr-2 tracking-[-0.02em] drop-shadow-sm dark:text-primary">Made Simple</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2, reduceMotion ?? false)} className="text-white/85 dark:text-muted-foreground max-w-[340px] sm:max-w-lg text-base sm:text-[17px] lg:text-lg leading-relaxed mb-8 font-medium">
            Short-term, long-term, or contract rentals — find verified properties, quality products, and 24/7 maintenance services across Saudi Arabia.
          </motion.p>

          <motion.div {...fadeUp(0.3, reduceMotion ?? false)} className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4 mb-8">
            <Link href="/properties" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto min-h-[44px] h-12 bg-white text-primary px-6 py-3 rounded-xl text-[15px] font-bold transition-all hover:bg-white/90 hover:shadow-lg active:scale-[0.98] shadow-md dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 touch-manipulation">
                Browse Rentals
              </button>
            </Link>
            <Link href="/maintenance" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto min-h-[44px] h-12 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-[15px] font-bold border-2 border-transparent transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] dark:bg-white/10 dark:border-white/35 dark:text-white dark:hover:bg-white/15 touch-manipulation">
                Request Maintenance
              </button>
            </Link>
          </motion.div>


        </div>

        {/* Right: 3D House Image */}
        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94, x: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.15 }}
          className="w-full lg:w-[52%] flex justify-center lg:justify-end pointer-events-none"
        >
          <div className="relative w-full max-w-[500px] sm:max-w-[580px] lg:max-w-[680px]">
            {/* Glow — blue in light, accent in dark; no animation if reduced motion */}
            {reduceMotion ? (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 dark:from-accent/25 dark:via-accent/15 dark:to-accent/5 rounded-full blur-[80px] -z-10"
                aria-hidden
              />
            ) : (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 dark:from-accent/25 dark:via-accent/15 dark:to-accent/5 rounded-full blur-[80px] -z-10"
                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              />
            )}

            <motion.div
              className="relative w-full aspect-square max-w-[500px] lg:max-w-[600px] flex items-center justify-center text-white dark:text-white drop-shadow-2xl"
              animate={reduceMotion ? undefined : {
                y: [0, -12, 0],
                filter: [
                  "drop-shadow(0 20px 40px rgba(0,0,0,0.2)) drop-shadow(0 0 40px rgba(255,255,255,0.08))",
                  "drop-shadow(0 28px 56px rgba(0,0,0,0.25)) drop-shadow(0 0 56px rgba(255,255,255,0.12))",
                  "drop-shadow(0 20px 40px rgba(0,0,0,0.2)) drop-shadow(0 0 40px rgba(255,255,255,0.08))"
                ]
              }}
              transition={reduceMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image 
                src="/images/hero-villa-3d.png" 
                alt="Luxury 3D Villa Hero" 
                width={800} 
                height={800} 
                className="w-full h-auto object-contain"
                priority 
              />
            </motion.div>
          </div>
        </motion.div>

        </div>
      </div>
    </section>
  );
}
