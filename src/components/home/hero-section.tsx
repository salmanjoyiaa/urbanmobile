"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
});

function HouseIllustration() {
  return (
    <svg
      viewBox="0 0 560 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      role="img"
      aria-label="Modern luxury villa illustration"
    >
      <style>{`
        .h-wall      { fill: #EDE4D5; }
        .h-wall2     { fill: #DDD3C2; }
        .h-roof      { fill: #2A201A; }
        .h-window    { fill: #A8CCDF; stroke: #2A201A; stroke-width: 1.5; }
        .h-win-div   { stroke: #2A201A; stroke-width: 1; fill: none; }
        .h-door      { fill: #2A201A; }
        .h-door-g    { fill: #A8CCDF; opacity: 0.5; }
        .h-accent    { fill: #B69780; }
        .h-a-stroke  { stroke: #B69780; fill: none; }
        .h-ground    { fill: #D0BAAA; }
        .h-trunk     { fill: #7A5A3A; }
        .h-leaves    { fill: #4A7850; }
        .h-particle  { fill: #B69780; }

        .dark .h-wall      { fill: #2D2520; }
        .dark .h-wall2     { fill: #231E18; }
        .dark .h-roof      { fill: #EEE6DC; }
        .dark .h-window    { fill: #B8860B; stroke: #EEE6DC; stroke-width: 1.5; }
        .dark .h-win-div   { stroke: #EEE6DC; stroke-width: 0.8; opacity: 0.5; fill: none; }
        .dark .h-door      { fill: #EEE6DC; }
        .dark .h-door-g    { fill: #D4A420; opacity: 0.75; }
        .dark .h-accent    { fill: #B69780; }
        .dark .h-a-stroke  { stroke: #B69780; fill: none; }
        .dark .h-ground    { fill: #18140F; }
        .dark .h-trunk     { fill: #6B4A2A; }
        .dark .h-leaves    { fill: #1E3A24; }
        .dark .h-particle  { fill: #B69780; }

        @keyframes h-win-glow {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.68; }
        }
        @keyframes h-dot-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        .h-win-anim { animation: h-win-glow 3.2s ease-in-out infinite; }
        .h-df1      { animation: h-dot-float 4s   ease-in-out infinite 0s; }
        .h-df2      { animation: h-dot-float 5s   ease-in-out infinite 0.8s; }
        .h-df3      { animation: h-dot-float 3.6s ease-in-out infinite 1.4s; }
      `}</style>

      {/* Ambient ground shadow */}
      <ellipse cx="282" cy="424" rx="210" ry="12" className="h-roof" opacity="0.06" />

      {/* Ground */}
      <rect x="0" y="404" width="560" height="56" className="h-ground" />
      <rect x="0" y="404" width="560" height="3" className="h-accent" opacity="0.25" />

      {/* ── LEFT WING ── */}
      <rect x="74" y="288" width="112" height="116" className="h-wall2" rx="2" />
      <rect x="64" y="274" width="132" height="18" className="h-roof" rx="3" />
      {/* left wing window */}
      <rect x="86" y="308" width="58" height="44" className="h-window h-win-anim" rx="3" />
      <line x1="115" y1="308" x2="115" y2="352" className="h-win-div" />
      {/* service / garage door */}
      <rect x="112" y="348" width="60" height="56" className="h-wall" rx="2" />
      <line x1="142" y1="348" x2="142" y2="404" className="h-a-stroke" strokeWidth="1" opacity="0.35" />
      <line x1="112" y1="367" x2="172" y2="367" className="h-a-stroke" strokeWidth="0.8" opacity="0.22" />
      <line x1="112" y1="384" x2="172" y2="384" className="h-a-stroke" strokeWidth="0.8" opacity="0.22" />

      {/* ── MAIN BUILDING ── */}
      <rect x="162" y="166" width="252" height="238" className="h-wall" rx="2" />
      {/* flat roof */}
      <rect x="148" y="150" width="280" height="20" className="h-roof" rx="4" />
      <rect x="148" y="166" width="280" height="4" className="h-roof" opacity="0.45" />
      {/* horizontal accent band */}
      <rect x="162" y="268" width="252" height="5" className="h-accent" />

      {/* upper windows */}
      <rect x="177" y="184" width="82" height="68" className="h-window h-win-anim" rx="4" />
      <line x1="218" y1="184" x2="218" y2="252" className="h-win-div" />
      <rect x="274" y="184" width="66" height="68" className="h-window h-win-anim" rx="4" />
      <rect x="354" y="184" width="44" height="68" className="h-window h-win-anim" rx="4" />

      {/* large ground-floor picture window */}
      <rect x="177" y="286" width="110" height="88" className="h-window h-win-anim" rx="4" />
      <line x1="232" y1="286" x2="232" y2="374" className="h-win-div" />
      <line x1="177" y1="330" x2="287" y2="330" className="h-win-div" opacity="0.4" />

      {/* door canopy */}
      <rect x="257" y="308" width="72" height="7" className="h-roof" rx="2" opacity="0.65" />

      {/* front door */}
      <rect x="267" y="314" width="52" height="90" className="h-door" rx="5" />
      <rect x="272" y="320" width="18" height="34" className="h-door-g" rx="2" />
      <rect x="295" y="320" width="18" height="34" className="h-door-g" rx="2" />
      {/* door handle */}
      <rect x="302" y="358" width="10" height="3" className="h-accent" rx="1.5" />

      {/* entrance steps */}
      <rect x="253" y="398" width="80" height="8" className="h-accent" opacity="0.55" rx="2" />
      <rect x="259" y="403" width="68" height="4" className="h-accent" opacity="0.28" rx="2" />

      {/* driveway */}
      <path d="M255 404 L222 432 L344 432 L311 404Z" className="h-accent" opacity="0.1" />
      <line x1="283" y1="404" x2="283" y2="432" className="h-a-stroke" strokeWidth="0.8" opacity="0.15" />

      {/* ── RIGHT WING ── */}
      <rect x="382" y="276" width="104" height="128" className="h-wall2" rx="2" />
      <rect x="370" y="260" width="130" height="18" className="h-roof" rx="3" />
      {/* accent strip on inner edge */}
      <rect x="382" y="276" width="4" height="128" className="h-accent" opacity="0.3" />
      {/* right wing windows */}
      <rect x="395" y="295" width="44" height="38" className="h-window h-win-anim" rx="3" />
      <rect x="450" y="295" width="28" height="38" className="h-window h-win-anim" rx="3" />

      {/* ── LEFT TREE ── */}
      <rect x="33" y="350" width="14" height="55" className="h-trunk" rx="5" />
      <ellipse cx="40" cy="328" rx="26" ry="32" className="h-leaves" />
      <ellipse cx="40" cy="315" rx="18" ry="23" className="h-leaves" opacity="0.65" />
      <ellipse cx="53" cy="338" rx="14" ry="17" className="h-leaves" opacity="0.5" />

      {/* ── RIGHT TREE ── */}
      <rect x="514" y="342" width="14" height="63" className="h-trunk" rx="5" />
      <ellipse cx="521" cy="318" rx="30" ry="36" className="h-leaves" />
      <ellipse cx="521" cy="304" rx="20" ry="26" className="h-leaves" opacity="0.65" />
      <ellipse cx="506" cy="330" rx="16" ry="19" className="h-leaves" opacity="0.5" />

      {/* ── FLOATING PARTICLES ── */}
      <circle cx="56" cy="148" r="5" className="h-particle h-df1" opacity="0.32" />
      <circle cx="82" cy="96" r="3.5" className="h-particle h-df2" opacity="0.22" />
      <circle cx="494" cy="124" r="5.5" className="h-particle h-df3" opacity="0.28" />
      <circle cx="526" cy="76" r="3.5" className="h-particle h-df1" opacity="0.18" />
      <circle cx="466" cy="54" r="2.5" className="h-particle h-df2" opacity="0.14" />

      {/* ── DECORATIVE DASH LINES ── */}
      <line x1="0" y1="115" x2="52" y2="115" stroke="#B69780" strokeWidth="1" opacity="0.13" strokeDasharray="4 7" />
      <line x1="508" y1="88" x2="560" y2="88" stroke="#B69780" strokeWidth="1" opacity="0.13" strokeDasharray="4 7" />
    </svg>
  );
}

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

        {/* Right: Animated SVG House */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="w-full lg:w-[52%] flex justify-center lg:justify-end pointer-events-none"
        >
          <div className="relative w-full max-w-[500px] sm:max-w-[580px] lg:max-w-[680px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] bg-[#D9C5B2]/25 dark:bg-[#B69780]/10 rounded-full blur-[70px]" />
            <div className="relative animate-float">
              <HouseIllustration />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
