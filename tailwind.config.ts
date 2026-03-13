import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        mono: ['"VT323"', "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        arcade: {
          green: "#00ff41",
          pink: "#ff006e",
          gold: "#ffbe0b",
          cyan: "#00f5ff",
          purple: "#bf00ff",
          dark: "#080010",
          panel: "#0d001a",
        },
        // Keep legacy names for compatibility
        "neon-purple": "#bf00ff",
        "neon-cyan": "#00f5ff",
        "neon-gold": "#ffbe0b",
        "neon-green": "#00ff41",
        "deep-space": "#080010",
        elevated: "#0d001a",
        brand: {
          primary: "#00ff41",
          secondary: "#ff006e",
        },
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #00ff41 0%, #00f5ff 100%)",
        "gradient-xp": "linear-gradient(90deg, #ffbe0b 0%, #ff006e 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(0,255,65,0.05) 0%, rgba(0,245,255,0.05) 100%)",
        scanlines:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      },
      boxShadow: {
        "pixel-green": "4px 4px 0px #006b1a, 0 0 15px rgba(0,255,65,0.4)",
        "pixel-pink": "4px 4px 0px #6b0030, 0 0 15px rgba(255,0,110,0.4)",
        "pixel-gold": "4px 4px 0px #6b4f00, 0 0 15px rgba(255,190,11,0.4)",
        "glow-green":
          "0 0 15px rgba(0,255,65,0.5), 0 0 30px rgba(0,255,65,0.2)",
        "glow-pink":
          "0 0 15px rgba(255,0,110,0.5), 0 0 30px rgba(255,0,110,0.2)",
        "glow-gold":
          "0 0 15px rgba(255,190,11,0.5), 0 0 30px rgba(255,190,11,0.2)",
        "glow-purple": "0 0 15px rgba(191,0,255,0.5)",
        "glow-purple-lg": "0 0 30px rgba(191,0,255,0.6)",
        "glow-gold-lg": "0 0 30px rgba(255,190,11,0.6)",
        "glow-cyan": "0 0 15px rgba(0,245,255,0.5)",
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
        DEFAULT: "0px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "pixel-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0,255,65,0.4)" },
          "50%": {
            boxShadow:
              "0 0 20px rgba(0,255,65,0.8), 0 0 40px rgba(0,255,65,0.4)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blink: "blink 1s step-start infinite",
        "pixel-glow": "pixel-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindAnimate],
};
export default config;
