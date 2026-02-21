import { Search, CalendarCheck, Key } from "lucide-react";

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
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-5 lg:px-12 max-w-[1400px]">
        <div className="text-center mb-14">
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#B69780] mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2A201A] tracking-tight">
            Find Your Home in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative bg-white rounded-2xl p-8 border border-[#eff3f4] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute -top-4 -right-2 text-[72px] font-black text-[#2A201A]/5 leading-none select-none">
                {item.step}
              </div>
              <div className="w-14 h-14 rounded-xl bg-[#2A201A] flex items-center justify-center mb-6">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2A201A] mb-3">{item.title}</h3>
              <p className="text-[#6B5A4E] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
