"use client";

import { useReducedMotion } from "framer-motion";

export function HeroHouseSvg({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`hero-house-svg ${className ?? ""}`.trim()}
      aria-hidden
    >
      <defs>
        <linearGradient id="house-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="house-roof" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Soft shadow behind house */}
      <g filter="url(#soft-shadow)" opacity={reduceMotion ? 1 : 0.8}>
        <ellipse cx="200" cy="295" rx="120" ry="12" fill="currentColor" />
      </g>

      {/* Main body — modern rectangular base */}
      <g
        style={
          reduceMotion
            ? undefined
            : {
                animation: "hero-house-float 5s ease-in-out infinite",
              }
        }
      >
        <rect
          x="80"
          y="140"
          width="240"
          height="155"
          rx="12"
          fill="url(#house-body)"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.3"
        />

        {/* Roof — flat modern style with overhang */}
        <path
          d="M60 140 L200 60 L340 140 L340 155 L60 155 Z"
          fill="url(#house-roof)"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.35"
          strokeLinejoin="round"
        />
        <rect x="80" y="135" width="240" height="8" rx="2" fill="currentColor" fillOpacity="0.4" />

        {/* Door */}
        <g
          style={
            reduceMotion
              ? undefined
              : { animation: "hero-house-door 3s ease-in-out 1s infinite" }
          }
        >
          <rect
            x="175"
            y="215"
            width="50"
            height="80"
            rx="6"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <circle cx="212" cy="255" r="3" fill="currentColor" fillOpacity="0.8" />
        </g>

        {/* Left window */}
        <g
          style={
            reduceMotion
              ? undefined
              : { animation: "hero-house-window 4s ease-in-out 0.5s infinite" }
          }
        >
          <rect
            x="100"
            y="165"
            width="45"
            height="38"
            rx="4"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <line x1="122.5" y1="165" x2="122.5" y2="203" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="100" y1="184" x2="145" y2="184" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* Right window */}
        <g
          style={
            reduceMotion
              ? undefined
              : { animation: "hero-house-window 4s ease-in-out 1.5s infinite" }
          }
        >
          <rect
            x="255"
            y="165"
            width="45"
            height="38"
            rx="4"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <line x1="277.5" y1="165" x2="277.5" y2="203" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="255" y1="184" x2="300" y2="184" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* Top window (attic style) */}
        <g
          style={
            reduceMotion
              ? undefined
              : { animation: "hero-house-window 4s ease-in-out 2s infinite" }
          }
        >
          <rect
            x="178"
            y="100"
            width="44"
            height="32"
            rx="4"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <line x1="200" y1="100" x2="200" y2="132" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="178" y1="116" x2="222" y2="116" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        </g>
      </g>

      {/* Glow ring — animated */}
      {!reduceMotion && (
        <circle
          cx="200"
          cy="220"
          r="165"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.12"
          style={{
            animation: "hero-house-glow 4s ease-in-out infinite",
          }}
        />
      )}

      <style>{`
        @keyframes hero-house-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes hero-house-window {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes hero-house-door {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
        @keyframes hero-house-glow {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50% { opacity: 0.18; transform: scale(1.02); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-house-svg * {
            animation: none !important;
          }
        }
      `}</style>
    </svg>
  );
}
