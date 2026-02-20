"use client";

import { useEffect, useState } from "react";
import { Home, Key, Sofa, Tv, BedDouble, Bath, Car, Building, MapPin, Lamp, Coffee, TreePine, Warehouse, Armchair, type LucideIcon } from "lucide-react";

const ICONS = [Home, Key, Sofa, Tv, BedDouble, Bath, Car, Building, MapPin, Lamp, Coffee, TreePine, Warehouse, Armchair];

interface FloatingElement {
    id: number;
    Icon: LucideIcon;
    size: number;
    top: number;
    left: number;
    animationDelay: number;
    animationDuration: number;
    opacity: number;
    rotation: number;
}

export function HeroBackground() {
    const [mounted, setMounted] = useState(false);
    const [elements, setElements] = useState<FloatingElement[]>([]);

    useEffect(() => {
        // Generate random positions only on the client to avoid hydration mismatch
        const newElements = Array.from({ length: 24 }).map((_, i) => {
            const Icon = ICONS[i % ICONS.length];
            const size = Math.random() * 40 + 24; // 24 to 64
            // Keep away from the very edges and try to distribute somewhat evenly
            const top = Math.random() * 80 + 10; // 10% to 90%
            const left = Math.random() * 90 + 5; // 5% to 95%
            const animationDelay = Math.random() * 5;
            const animationDuration = Math.random() * 6 + 6; // 6 to 12s
            const opacity = Math.random() * 0.1 + 0.05; // 0.05 to 0.15
            const rotation = Math.random() * 45 - 22.5; // -22.5 to 22.5 deg

            return {
                id: i,
                Icon,
                size,
                top,
                left,
                animationDelay,
                animationDuration,
                opacity,
                rotation,
            };
        });
        setElements(newElements);
        setMounted(true);
    }, []);

    if (!mounted) {
        // SSR Fallback (just the orbs)
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1.5s" }} />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Ambient gradient orbs */}
            <div className="absolute inset-0 opacity-15">
                <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1.5s" }} />
            </div>

            {/* Floating Property/Household Icons */}
            <div className="absolute inset-0 z-0">
                {elements.map((el) => (
                    <div
                        key={el.id}
                        className="absolute text-white animate-float transition-opacity duration-1000"
                        style={{
                            top: `${el.top}%`,
                            left: `${el.left}%`,
                            animationDelay: `${el.animationDelay}s`,
                            animationDuration: `${el.animationDuration}s`,
                            opacity: el.opacity,
                        }}
                    >
                        <div style={{ transform: `rotate(${el.rotation}deg)` }}>
                            <el.Icon size={el.size} strokeWidth={1} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
