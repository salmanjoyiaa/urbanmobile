"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

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
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-5 lg:px-12 max-w-[1400px]">
        <div className="text-center mb-14">
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#B69780] mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2A201A] tracking-tight">
            What Our Clients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.slice(0, 6).map((t) => (
            <div
              key={t.id}
              className="bg-[#FCF9F2] rounded-2xl p-7 border border-[#D9C5B2]/30 hover:shadow-lg transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-5 right-5 h-8 w-8 text-[#D9C5B2]/40" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "fill-[#F5A623] text-[#F5A623]" : "text-[#D9C5B2]"}`}
                  />
                ))}
              </div>

              <p className="text-[#2A201A] leading-relaxed mb-6 text-[15px]">
                &quot;{t.content}&quot;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-[#D9C5B2]/20">
                <div className="w-10 h-10 rounded-full bg-[#2A201A] flex items-center justify-center text-white font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#2A201A] text-sm">{t.name}</p>
                  <p className="text-[#B69780] text-xs font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
