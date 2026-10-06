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
          DEFAULT: "#7A1C2E",
          hover: "#631625",
          active: "#4D111D",
          light: "#FBF2F4",
          "very-light": "#FDF7F8",
          foreground: "#FFFFFF",
        },
        gold: {
          DEFAULT: "#C69214",
          hover: "#B28210",
          active: "#9A6F0A",
          light: "#FDF8ED",
          "very-light": "#FFFDF8",
          accent: "#D4A017",
          foreground: "#FFFFFF",
        },
        sidebar: {
          DEFAULT: "#131014",
          secondary: "#1B171C",
          hover: "#251F27",
          active: "#7A1C2E",
          border: "#29222C",
          text: "#FAF8F5",
          "text-secondary": "#D3CBC2",
          muted: "#8F8580",
          accent: "#D4A017",
        },
        background: "#FAF8F5",
        "background-alt": "#F4EFEA",
        surface: "#FFFFFF",
        text: {
          primary: "#1f2937",
          secondary: "#4b5563",
          muted: "#6b7280",
          disabled: "#9ca3af",
        },
        border: {
          DEFAULT: "#EBE4D8",
          light: "#F5F0E6",
          strong: "#D5CAB8",
        },
        success: { DEFAULT: "#15803D", bg: "#F0FDF4" },
        warning: { DEFAULT: "#D97706", bg: "#FFFBEB" },
        danger: { DEFAULT: "#DC2626", bg: "#FEF2F2" },
        info: { DEFAULT: "#2563EB", bg: "#EFF6FF" },
        skeleton: "#EBE4D8",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Roboto", "system-ui", "sans-serif"],
        ethiopic: ["var(--font-noto-ethiopic)", "Noto Sans Ethiopic", "sans-serif"],
      },
      fontSize: {
        // Strict modular rem scale relative to 14px base: 12 / 14 / 16 / 20 / 24 / 32
        small: ["0.857rem", { lineHeight: "1.4", fontWeight: "400" }],        // 12px
        label: ["0.857rem", { lineHeight: "1.4", fontWeight: "500" }],        // 12px
        caption: ["0.857rem", { lineHeight: "1.4", fontWeight: "400" }],      // 12px
        body: ["1rem", { lineHeight: "1.45", fontWeight: "400" }],            // 14px (ERP body & table data)
        button: ["1rem", { lineHeight: "1.45", fontWeight: "500" }],          // 14px (medium weight)
        sidebar: ["1rem", { lineHeight: "1.45", fontWeight: "500" }],         // 14px (medium weight)
        "card-title": ["1.143rem", { lineHeight: "1.4", fontWeight: "600" }], // 16px
        "section-title": ["1.143rem", { lineHeight: "1.4", fontWeight: "600" }], // 16px
        "modal-title": ["1.428rem", { lineHeight: "1.35", fontWeight: "600" }], // 20px
        "page-title": ["1.714rem", { lineHeight: "1.3", fontWeight: "600" }],   // 24px
        kpi: ["2.285rem", { lineHeight: "1.15", fontWeight: "700" }],          // 32px (bold)
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
        card: "0 1px 3px rgba(35, 20, 10, 0.04), 0 1px 2px rgba(35, 20, 10, 0.02)",
        elevated: "0 4px 14px rgba(35, 20, 10, 0.07), 0 1px 3px rgba(35, 20, 10, 0.04)",
        modal: "0 16px 36px rgba(25, 15, 8, 0.16), 0 4px 12px rgba(25, 15, 8, 0.08)",
        "glow-gold": "0 0 16px rgba(198, 146, 20, 0.25)",
        "glow-primary": "0 0 16px rgba(122, 28, 46, 0.25)",
      },
      height: {
        "control-sm": "32px",
        "control-md": "38px",
        "control-lg": "42px",
        header: "56px",
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
