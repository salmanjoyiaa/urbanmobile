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
    return <div className="min-h-11 min-w-11 flex items-center justify-center rounded-full bg-muted/80" aria-hidden />;
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative flex items-center justify-center min-h-11 min-w-11 rounded-full px-0.5 transition-colors duration-300 border ${
        isDark
          ? "bg-slate-800 border-border"
          : "bg-slate-100 border-border"
      } w-14 h-7`}
      whileTap={{ scale: 0.94 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sliding knob */}
      <motion.div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          isDark
            ? "bg-primary shadow-[0_2px_8px_hsl(var(--primary)/0.4)]"
            : "bg-white shadow-[0_2px_6px_rgba(42,32,26,0.18)]"
        }`}
        animate={{ x: isDark ? 27 : 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -60, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 60, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.18 }}
            >
              <Sun className="h-3.5 w-3.5 text-slate-900" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 60, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -60, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.18 }}
            >
              <Moon className="h-3.5 w-3.5 text-slate-700" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
