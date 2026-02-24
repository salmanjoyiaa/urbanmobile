"use client";

import { Search, CalendarCheck, Key } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse & Discover",
    description: "Explore verified properties across Saudi Arabia filtered by city, type, and budget.",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Schedule a Visit",
    description: "Pick a convenient time slot and our visiting team will arrange a guided tour.",
  },
  {
    icon: Key,
    step: "03",
    title: "Move In",
    description: "Finalize your lease with the property agent and get your keys — it's that simple.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-background dark:bg-[#0F0D0B]">
      <div className="container mx-auto px-5 lg:px-12 max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-primary mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Find Your Home in 3 Steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
              className="relative bg-card dark:bg-[#1A1614] rounded-2xl p-8 border border-border dark:border-white/5 hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-shadow duration-300 cursor-default"
            >
              <div className="absolute -top-4 -right-2 text-[72px] font-black text-foreground/5 dark:text-white/5 leading-none select-none">
                {item.step}
              </div>
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6">
                <item.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
