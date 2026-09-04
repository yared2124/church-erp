import type { Config } from "tailwindcss";

/**
 * DESIGN SYSTEM — single source of truth.
 * Every color, radius, shadow, spacing, and font-size used across the ERP
 * must come from this file. Never hardcode a hex value or an arbitrary
 * pixel size inside a component — extend this file instead.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          active: "#3730A3",
          light: "#EEF2FF",
          "very-light": "#F5F7FF",
          foreground: "#FFFFFF",
        },
        sidebar: {
          DEFAULT: "#0F1B33",
          secondary: "#162544",
          hover: "#1C2E52",
          active: "#4F46E5",
          text: "#F8FAFC",
          "text-secondary": "#CBD5E1",
          muted: "#94A3B8",
        },
        background: "#F7F8FC",
        "background-alt": "#F9FAFB",
        surface: "#FFFFFF",
        text: {
          primary: "#111827",
          secondary: "#475569",
          muted: "#94A3B8",
          disabled: "#CBD5E1",
        },
        border: {
          DEFAULT: "#E5E7EB",
          light: "#EEF0F4",
          strong: "#D1D5DB",
        },
        success: { DEFAULT: "#16A34A", bg: "#ECFDF3" },
        warning: { DEFAULT: "#F59E0B", bg: "#FFFBEB" },
        danger: { DEFAULT: "#EF4444", bg: "#FEF2F2" },
        info: { DEFAULT: "#3B82F6", bg: "#EFF6FF" },
        skeleton: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        ethiopic: ["var(--font-noto-ethiopic)", "Noto Sans Ethiopic", "sans-serif"],
      },
      fontSize: {
        "page-title": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "section-title": ["19px", { lineHeight: "1.3", fontWeight: "600" }],
        "card-title": ["15px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["12.5px", { lineHeight: "1.4", fontWeight: "400" }],
        label: ["13px", { lineHeight: "1.3", fontWeight: "500" }],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06)",
        elevated: "0 4px 12px rgba(15, 23, 42, 0.08)",
        modal: "0 12px 32px rgba(15, 23, 42, 0.15)",
      },
      height: {
        "control-sm": "32px",
        "control-md": "40px",
        "control-lg": "44px",
        header: "72px",
      },
      width: {
        sidebar: "260px",
        "sidebar-collapsed": "76px",
      },
      // Padding utilities (pl-sidebar, pl-sidebar-collapsed) pull from the
      // spacing scale, not `width` — duplicated here so AppShell's content
      // padding can stay pixel-for-pixel in sync with the sidebar's width.
      padding: {
        sidebar: "260px",
        "sidebar-collapsed": "76px",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
