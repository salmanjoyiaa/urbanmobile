"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url: string | null;
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => setTestimonials(data.testimonials || []))
      .catch(() => {});
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-background dark:bg-[#0A0907]">
      <div className="container mx-auto px-5 lg:px-12 max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-primary mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            What Our Clients Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.slice(0, 6).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="bg-card dark:bg-[#1A1614] rounded-2xl p-7 border border-border dark:border-white/5 hover:shadow-lg dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.35)] transition-shadow duration-300 relative cursor-default"
            >
              <Quote className="absolute top-5 right-5 h-8 w-8 text-muted-foreground/40 dark:text-white/10" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4 w-4 ${idx < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 dark:text-white/15"}`}
                  />
                ))}
              </div>

              <p className="text-foreground dark:text-white/80 leading-relaxed mb-6 text-[15px]">
                &quot;{t.content}&quot;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border dark:border-white/10">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
