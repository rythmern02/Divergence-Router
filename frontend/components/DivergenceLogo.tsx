"use client";

import React from "react";

interface DivergenceLogoProps {
  size?: number;
  className?: string;
  useImage?: boolean;
}

export const DivergenceLogo: React.FC<DivergenceLogoProps> = ({
  size = 36,
  className = "",
  useImage = false,
}) => {
  if (useImage) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-white/[0.12] bg-black shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src="/assets/logo.jpg"
          alt="Divergence Router Logo"
          className="w-full h-full object-cover scale-110"
        />
      </div>
    );
  }

  // Precision Geometric Vector Glyph
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-[#0e121a] border border-white/[0.1] shadow-md ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size * 0.72}
        height={size * 0.72}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="metalBevelLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="metalBevelRight" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="innerCore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
        </defs>

        {/* Left Diverging Arm */}
        <path
          d="M 18 24 L 35 24 L 48 48 L 48 76 L 38 66 L 38 52 L 23 32 Z"
          fill="url(#innerCore)"
          stroke="url(#metalBevelLeft)"
          strokeWidth="3.5"
          strokeLinejoin="miter"
          strokeMiterlimit="4"
        />

        {/* Right Diverging Arm (Mirrored) */}
        <path
          d="M 82 24 L 65 24 L 52 48 L 52 76 L 62 66 L 62 52 L 77 32 Z"
          fill="url(#innerCore)"
          stroke="url(#metalBevelRight)"
          strokeWidth="3.5"
          strokeLinejoin="miter"
          strokeMiterlimit="4"
        />

        {/* Center Keystone Origin Point */}
        <circle cx="50" cy="84" r="2.5" fill="#f8fafc" />
      </svg>
    </div>
  );
};
