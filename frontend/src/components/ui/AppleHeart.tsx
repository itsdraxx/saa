import React from "react";

interface AppleHeartProps {
  className?: string;
  size?: number | string;
}

/**
 * Apple-style 3D glossy Red Heart icon.
 * Renders identically across all devices and OSes (Android, iOS, Windows, Mac),
 * eliminating the device-dependent emoji font rendering.
 */
export default function AppleHeart({
  className = "inline-block",
  size = "1em",
}: AppleHeartProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className={className}
      style={{ verticalAlign: "-0.15em", display: "inline-block" }}
      aria-label="love heart"
      role="img"
    >
      <defs>
        {/* Soft 3D drop shadow underneath */}
        <filter id="appleHeartShadow" x="-20%" y="-15%" width="140%" height="145%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#4A000A" floodOpacity="0.45" />
        </filter>

        {/* Apple signature rich ruby gradient */}
        <linearGradient id="appleHeartBody" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FF4D5E" />
          <stop offset="25%" stopColor="#FF2A41" />
          <stop offset="55%" stopColor="#E0072B" />
          <stop offset="85%" stopColor="#B3001E" />
          <stop offset="100%" stopColor="#7A0012" />
        </linearGradient>

        {/* Top-left radiant dome highlight */}
        <radialGradient id="appleHeartRadial" cx="32%" cy="28%" r="48%">
          <stop offset="0%" stopColor="#FFCCD3" stopOpacity="0.75" />
          <stop offset="40%" stopColor="#FF5C70" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E0072B" stopOpacity="0" />
        </radialGradient>

        {/* Liquid-glass specular curve highlight */}
        <linearGradient id="appleGlassGloss" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Right lobe soft secondary reflection */}
        <linearGradient id="appleRightGloss" x1="50%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main Heart Base with Drop Shadow */}
      <path
        d="M 18 32.5 C 17.3 32.5 7.2 23.2 3.8 17.6 C 0.8 12.6 1.8 6.4 7.2 3.6 C 11.5 1.4 15.6 4.1 18 7.2 C 20.4 4.1 24.5 1.4 28.8 3.6 C 34.2 6.4 35.2 12.6 32.2 17.6 C 28.8 23.2 18.7 32.5 18 32.5 Z"
        fill="url(#appleHeartBody)"
        filter="url(#appleHeartShadow)"
      />

      {/* 3D Radiant Volume Glow */}
      <path
        d="M 18 32.5 C 17.3 32.5 7.2 23.2 3.8 17.6 C 0.8 12.6 1.8 6.4 7.2 3.6 C 11.5 1.4 15.6 4.1 18 7.2 C 20.4 4.1 24.5 1.4 28.8 3.6 C 34.2 6.4 35.2 12.6 32.2 17.6 C 28.8 23.2 18.7 32.5 18 32.5 Z"
        fill="url(#appleHeartRadial)"
      />

      {/* Signature Apple Glossy Highlight Curve (Left Lobe) */}
      <path
        d="M 8.8 5.6 C 6.2 7.2 4.5 10.4 5.2 13.8 C 5.5 15.2 6.5 17.2 8.5 19.5 C 8.2 17.8 7.6 15.2 8.1 12.8 C 8.8 9.5 11.8 7.2 14.5 6.8 C 12.8 5.6 10.5 5 8.8 5.6 Z"
        fill="url(#appleGlassGloss)"
      />

      {/* Subtle Right Lobe Highlight */}
      <path
        d="M 27.2 5.6 C 29.2 7.0 30.5 9.8 30.2 12.8 C 29.8 10.5 28.2 8.2 25.5 7.2 C 26.2 6.5 26.7 6 27.2 5.6 Z"
        fill="url(#appleRightGloss)"
      />

      {/* Micro Specular Pinpoint Reflection (Top-Left Dome) */}
      <ellipse cx="11.2" cy="8.2" rx="2" ry="1.2" transform="rotate(-25 11.2 8.2)" fill="#FFFFFF" opacity="0.65" />
    </svg>
  );
}
