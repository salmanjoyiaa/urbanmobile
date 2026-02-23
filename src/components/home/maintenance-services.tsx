import { Wrench, ShieldCheck, Zap, Droplets, PaintRoller, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

const services = [
    {
        icon: Droplets,
        title: "Plumbing",
        description: "Expert solutions for leaks, installations, and repairs.",
    },
    {
        icon: Zap,
        title: "Electrical",
        description: "Safe and reliable electrical troubleshooting and setup.",
    },
    {
        icon: Wrench,
        title: "HVAC",
        description: "Air conditioning maintenance and heating systems repair.",
    },
    {
        icon: PaintRoller,
        title: "Renovations",
        description: "Full-scale painting and property refurbishment services.",
    },
];

export function MaintenanceServices() {
    return (
        <section className="py-24 bg-[#FCF9F2] relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 sm:gap-8">
                    <div className="max-w-xl text-center md:text-left mx-auto md:mx-0">
                        <h2 className="text-[34px] sm:text-[36px] md:text-[48px] font-extrabold text-[#2A201A] leading-[1.1] mb-5">
                            Premium Property <br className="hidden md:block" />
                            Maintenance.
                        </h2>
                        <p className="text-[16px] sm:text-[17px] text-[#6B5A4E] leading-relaxed mx-auto max-w-sm sm:max-w-none">
                            We provide end-to-end maintenance services managed by certified professionals. Keep your property in pristine condition effortlessly.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white shadow-sm border border-[#D9C5B2]/30 px-5 py-2">
                                <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                                <span className="text-[13px] font-bold text-[#2A201A]">Emergency: 1-Hour</span>
                            </div>
                            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white shadow-sm border border-[#D9C5B2]/30 px-5 py-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-[13px] font-bold text-[#2A201A]">Standard: 24-Hour</span>
                            </div>
                        </div>
                    </div>
                    <Link href="/maintenance" className="w-full md:w-auto">
                        <button className="w-full md:w-auto h-14 bg-white border-2 border-[#D9C5B2]/40 text-[#2A201A] px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-[#2A201A] hover:bg-[#FCF9F2] active:scale-[0.98] transition-all group shadow-sm">
                            Request Service
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, i) => (
                        <div
                            key={i}
                            className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-[#D9C5B2]/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group hover:-translate-y-1 text-center md:text-left"
                        >
                            <div className="w-14 h-14 bg-[#FCF9F2] border border-[#D9C5B2]/40 rounded-2xl mx-auto md:mx-0 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                                <service.icon className="w-6 h-6 text-[#2A201A]" />
                            </div>
                            <h3 className="text-[18px] md:text-[20px] font-extrabold text-[#2A201A] mb-2">{service.title}</h3>
                            <p className="text-[#6B5A4E] leading-relaxed text-[14px] md:text-[15px]">{service.description}</p>
                        </div>
                    ))}
                </div>

                {/* Global Security Badge */}
                <div className="mt-16 flex items-center justify-center gap-3 text-[#6B5A4E]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[14px] font-semibold uppercase tracking-widest">
                        All agents physically verified across Saudi Arabia
                    </span>
                </div>
            </div>
        </section>
    );
}
