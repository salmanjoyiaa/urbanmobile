"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
});

export function HeroSection() {
  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12 pt-4 pb-16 lg:pt-6 lg:pb-24">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-4">

        {/* Left: Text */}
        <div className="w-full lg:w-[48%] z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-sm px-4 py-1.5 border border-[#2A201A]/10 dark:border-white/10 mb-6 shadow-sm">
            <span className="text-[11px] lg:text-[12px] font-black text-[#2A201A] dark:text-white/80 tracking-[0.15em] uppercase">
              Trusted by 500+ tenants across KSA
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-[48px] sm:text-[56px] md:text-[64px] lg:text-[76px] font-black tracking-[-0.04em] leading-[1] mb-5 text-[#2A201A] dark:text-white drop-shadow-sm"
          >
            Your Next Home,<br className="hidden sm:block" />{" "}
            <span className="text-[#B69780] font-medium italic pr-2 tracking-[-0.02em]">Made&nbsp;Simple.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-[#6B5A4E] dark:text-white/55 max-w-[340px] sm:max-w-lg text-[16px] sm:text-[18px] leading-[1.6] mb-8 font-medium">
            Short-term, long-term, or contract rentals. Find verified properties, quality products, and 24/7 maintenance services.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 mb-8">
            <Link href="/properties" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 bg-[#2A201A] dark:bg-[#B69780] text-white dark:text-[#0F0D0B] px-10 rounded-2xl text-[16px] font-bold transition-all hover:bg-black dark:hover:bg-[#c4a892] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#2A201A]/20 dark:shadow-[#B69780]/20">
                Browse Rentals
              </button>
            </Link>
            <Link href="/maintenance" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 bg-white dark:bg-white/5 text-[#2A201A] dark:text-white px-10 rounded-2xl text-[16px] font-bold border-2 border-[#D9C5B2]/40 dark:border-white/10 transition-all hover:border-[#2A201A] dark:hover:border-white/30 hover:bg-[#FCF9F2] dark:hover:bg-white/10 active:scale-[0.98] shadow-sm">
                Request Maintenance
              </button>
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="hidden md:flex items-center gap-6 text-sm text-[#6B5A4E]">
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-3 py-1.5 rounded-full border border-[#D9C5B2]/30 dark:border-white/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-[13px] dark:text-white/70">1-Hour Emergency Response</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-3 py-1.5 rounded-full border border-[#D9C5B2]/30 dark:border-white/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-[13px] dark:text-white/70">24-Hour Standard Service</span>
            </div>
          </motion.div>
        </div>

        {/* Right: 3D House Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="w-full lg:w-[52%] flex justify-center lg:justify-end pointer-events-none"
        >
          <div className="relative w-full max-w-[500px] sm:max-w-[580px] lg:max-w-[680px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] bg-[#D9C5B2]/25 dark:bg-[#B69780]/10 rounded-full blur-[70px]" />
            <div className="relative animate-float">
              {/* Dark mode: white rounded card frames the house intentionally */}
              <div className="dark:bg-white dark:rounded-3xl dark:overflow-hidden dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                <Image
                  src="/3d-house.png"
                  alt="3D House"
                  width={680}
                  height={550}
                  className="w-full h-auto object-contain drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal"
                  priority
                />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
