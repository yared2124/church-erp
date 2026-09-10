import * as React from "react";
import { cn } from "@/lib/utils";

interface EthiopicCrossProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "gold" | "burgundy" | "white" | "current";
}

/**
 * Authentic Ethiopian Orthodox Cross (የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ መስቀል)
 * Inspired by classic Lalibela and Gondarine processional brass & gold crosses.
 */
export function EthiopicCross({
  size = 24,
  variant = "gold",
  className,
  ...props
}: EthiopicCrossProps) {
  const colorClass =
    variant === "gold"
      ? "text-gold fill-gold"
      : variant === "burgundy"
      ? "text-primary fill-primary"
      : variant === "white"
      ? "text-white fill-white"
      : "text-current fill-current";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(colorClass, "shrink-0 transition-transform duration-200", className)}
      {...props}
    >
      {/* Central Cross Pillar */}
      <rect x="22" y="4" width="4" height="40" rx="1" fill="currentColor" />
      {/* Horizontal Cross Bar */}
      <rect x="4" y="16" width="40" height="4" rx="1" fill="currentColor" />

      {/* Top Cross Finial / Crown */}
      <circle cx="24" cy="4" r="3" fill="currentColor" />
      <circle cx="24" cy="10" r="2" fill="currentColor" />
      <path d="M20 6 L24 2 L28 6 Z" fill="currentColor" />

      {/* Bottom Cross Base (Mount Golgotha motif) */}
      <circle cx="24" cy="44" r="3" fill="currentColor" />
      <path d="M18 44 C18 41 21 38 24 38 C27 38 30 41 30 44 Z" fill="currentColor" />

      {/* Left Finial */}
      <circle cx="4" cy="18" r="3" fill="currentColor" />
      <circle cx="10" cy="18" r="2" fill="currentColor" />
      <path d="M6 14 L2 18 L6 22 Z" fill="currentColor" />

      {/* Right Finial */}
      <circle cx="44" cy="18" r="3" fill="currentColor" />
      <circle cx="38" cy="18" r="2" fill="currentColor" />
      <path d="M42 14 L46 18 L42 22 Z" fill="currentColor" />

      {/* Central Sacred Rosette / Diamond Nexus */}
      <path
        d="M24 13 L29 18 L24 23 L19 18 Z"
        fill="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="18" r="2" fill="var(--color-surface, #FFFFFF)" />

      {/* Four Interlaced Quadrant Knots (Lalibela geometric pattern) */}
      <path
        d="M16 11 C16 13 18 15 20 15 C18 15 16 17 16 19 C16 17 14 15 14 15 C14 15 16 13 16 11 Z"
        fill="currentColor"
      />
      <path
        d="M32 11 C32 13 34 15 34 15 C34 15 32 17 32 19 C32 17 30 15 30 15 C30 15 32 13 32 11 Z"
        fill="currentColor"
      />
      <path
        d="M16 23 C16 25 18 27 20 27 C18 27 16 29 16 31 C16 29 14 27 14 27 C14 27 16 25 16 23 Z"
        fill="currentColor"
      />
      <path
        d="M32 23 C32 25 34 27 34 27 C34 27 32 29 32 31 C32 29 30 27 30 27 C30 27 32 25 32 23 Z"
        fill="currentColor"
      />
    </svg>
  );
}
