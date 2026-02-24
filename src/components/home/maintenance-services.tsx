"use client";

import { Wrench, ShieldCheck, Zap, Droplets, PaintRoller, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
        <section className="py-24 bg-section-cream dark:bg-[#0F0D0B] relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 sm:gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-xl text-center md:text-left mx-auto md:mx-0"
                    >
                        <h2 className="text-[34px] sm:text-[36px] md:text-[48px] font-extrabold text-foreground leading-[1.1] mb-5">
                            Premium Property <br className="hidden md:block" />
                            Maintenance.
                        </h2>
                        <p className="text-[16px] sm:text-[17px] text-muted-foreground leading-relaxed mx-auto max-w-sm sm:max-w-none">
                            We provide end-to-end maintenance services managed by certified professionals. Keep your property in pristine condition effortlessly.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-card dark:bg-white/5 shadow-sm border border-border dark:border-white/10 px-5 py-2">
                                <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                                <span className="text-[13px] font-bold text-foreground">Emergency: 1-Hour</span>
                            </div>
                            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-card dark:bg-white/5 shadow-sm border border-border dark:border-white/10 px-5 py-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-[13px] font-bold text-foreground">Standard: 24-Hour</span>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link href="/maintenance" className="w-full md:w-auto">
                            <button className="w-full md:w-auto h-14 bg-card dark:bg-white/10 border-2 border-border dark:border-white/35 text-foreground dark:text-white px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-primary dark:hover:border-white/50 hover:bg-muted/50 dark:hover:bg-white/15 active:scale-[0.98] transition-all group shadow-sm">
                                Request Service
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                            whileHover={{ y: -5, transition: { duration: 0.25 } }}
                            className="bg-card/90 dark:bg-[#1A1614]/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all text-center md:text-left group cursor-default"
                        >
                            <div className="w-14 h-14 bg-muted dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl mx-auto md:mx-0 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                                <service.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-[18px] md:text-[20px] font-extrabold text-foreground mb-2">{service.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-[14px] md:text-[15px]">{service.description}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 flex items-center justify-center gap-3 text-muted-foreground dark:text-white/40"
                >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[14px] font-semibold uppercase tracking-widest">
                        All agents physically verified across Saudi Arabia
                    </span>
                </motion.div>
            </div>
        </section>
    );
}
