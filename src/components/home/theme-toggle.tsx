"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div 
        className="relative flex items-center justify-center w-11 h-11" 
        aria-hidden 
      >
        <div className="w-[46px] h-[26px] rounded-full bg-slate-200/50 dark:bg-slate-800/50" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-11 h-11 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full transition-transform active:scale-95"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Pill Background */}
      <span className="relative flex items-center w-[46px] h-[26px] rounded-full bg-slate-200 dark:bg-slate-700/60 group-hover:bg-slate-300 dark:group-hover:bg-slate-600/80 border border-black/5 dark:border-white/10 transition-colors duration-200 shadow-inner overflow-hidden">
        
        {/* Sliding Knob */}
        <motion.span 
          initial={false}
          animate={{ x: isDark ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute left-[3px] flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-[#0F0D0B] shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-slate-200/50 dark:border-slate-800 z-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                <Moon className="w-[11px] h-[11px] text-indigo-400" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                <Sun className="w-[11px] h-[11px] text-amber-500" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.span>
      </span>
    </button>
  );
}
