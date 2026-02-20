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
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#2A201A] leading-tight mb-4">
                            Premium Property <br className="hidden md:block" />
                            Maintenance.
                        </h2>
                        <p className="text-[17px] text-[#6B5A4E] leading-relaxed">
                            We provide end-to-end maintenance services managed by certified professionals. Keep your property in pristine condition effortlessly.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#2A201A] px-4 py-2">
                                <Clock className="w-4 h-4 text-red-400" />
                                <span className="text-[13px] font-bold text-white">Emergency: 1-Hour Response</span>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#D9C5B2]/30 px-4 py-2">
                                <Clock className="w-4 h-4 text-[#6B5A4E]" />
                                <span className="text-[13px] font-bold text-[#2A201A]">Standard: 24-Hour Service</span>
                            </div>
                        </div>
                    </div>
                    <Link href="/maintenance">
                        <button className="h-12 border-2 border-[#2A201A] text-[#2A201A] px-8 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2A201A] hover:text-white transition-all group">
                            Request Service
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, i) => (
                        <div
                            key={i}
                            className="bg-white/50 backdrop-blur-md rounded-2xl p-8 border border-[#D9C5B2]/30 hover:shadow-xl hover:shadow-[#2A201A]/5 transition-all group hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 bg-[#D9C5B2]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <service.icon className="w-7 h-7 text-[#2A201A]" />
                            </div>
                            <h3 className="text-[20px] font-bold text-[#2A201A] mb-3">{service.title}</h3>
                            <p className="text-[#6B5A4E] leading-relaxed text-[15px]">{service.description}</p>
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
