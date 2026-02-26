"use client";

import Link from "next/link";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function JoinTeam() {
  return (
    <section className="py-20 lg:py-28 bg-footer dark:bg-[#0F0D0B]">
      <div className="container mx-auto px-5 lg:px-12 max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/80 mb-3 md:mb-4">Join Us</p>
          <h2 className="text-[32px] md:text-4xl lg:text-5xl font-extrabold text-white tracking-[-0.02em] leading-tight">
            Grow Your Career With Us
          </h2>
          <p className="mt-4 text-white/75 max-w-sm md:max-w-xl mx-auto text-[16px] md:text-lg leading-relaxed">
            Whether you manage properties or conduct tours, join Saudi Arabia&apos;s fastest-growing real estate platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Property Agent Card — white on dark blue band */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className="bg-white dark:bg-[#1A1614] rounded-3xl p-6 md:p-8 border border-white/20 dark:border-white/5 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col text-center md:text-left cursor-default"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-5 md:mb-6 mx-auto md:mx-0 shadow-lg shadow-primary/20">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-[22px] font-extrabold text-foreground dark:text-white mb-3">Aqari Agent</h3>
            <p className="text-muted-foreground dark:text-white/70 text-[15px] md:text-[16px] leading-relaxed mb-6 md:mb-8 flex-1 max-w-sm mx-auto md:mx-0">
              List and manage rental properties, connect with tenants, and grow your portfolio on our verified platform.
            </p>
            <Link
              href="/signup/agent?type=property"
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground px-6 py-4 md:py-3.5 text-[15px] font-bold transition-all hover:bg-primary/90 active:scale-95 shadow-md"
            >
              Apply as Aqari
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Visiting Team Card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className="bg-white dark:bg-[#1A1614] rounded-3xl p-6 md:p-8 border border-white/20 dark:border-white/5 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col text-center md:text-left cursor-default"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-5 md:mb-6 mx-auto md:mx-0 shadow-lg shadow-primary/20">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-[22px] font-extrabold text-foreground dark:text-white mb-3">Team Agent</h3>
            <p className="text-muted-foreground dark:text-white/70 text-[15px] md:text-[16px] leading-relaxed mb-6 md:mb-8 flex-1 max-w-sm mx-auto md:mx-0">
              Conduct property tours, guide tenants through viewings, and help close deals across Saudi Arabia.
            </p>
            <Link
              href="/signup/agent?type=visiting"
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-transparent px-6 py-4 md:py-3.5 text-[15px] font-bold text-primary transition-all hover:bg-primary/5 active:scale-95 shadow-sm dark:border-white dark:text-white dark:bg-white/10 dark:hover:bg-white/15"
            >
              Apply as Team Agent
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
