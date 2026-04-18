import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "system-ui", "sans-serif"],
      },
      colors: {
        "met-base--2": "#08080c",
        "met-base--1": "#12121c",
        "met-base-0": "#181825",
        "met-base-1": "#202031",
        "met-base-2": "#262636",
        "met-container": "#18192c",
        "met-container-sec": "#1e1f35",
        "met-container-v3": "#30314f",
        "met-text": "#f9f9fb",
        "met-text-sec": "#9595b2",
        "met-text-ter": "#6c6c89",
        "met-text-disabled": "#565676",
        "met-text-title": "#f5f5ff",
        "met-primary-25": "#150d30",
        "met-primary-50": "#231650",
        "met-primary-100": "#372380",
        "met-primary-200": "#452ba1",
        "met-primary-300": "#5c3ad4",
        "met-primary-400": "#6e45ff",
        "met-primary-500": "#8664ff",
        "met-primary-600": "#9e83ff",
        "met-primary-700": "#b6a2ff",
        "met-primary-800": "#cfc1ff",
        "met-accent-300": "#cc3f00",
        "met-accent-400": "#f54b00",
        "met-accent-500": "#f76727",
        "met-accent-600": "#f8824e",
        "met-accent-700": "#fa9e76",
        "met-success": "#24c98d",
        "met-danger": "#f04438",
        "met-warning": "#f79009",
        "met-blue": "#36bffa",
        "met-border": "#434360",
        "met-border-sec": "#2a2a3c",
        "met-border-ter": "#202031",
        "met-stroke": "#2c2e49",
        "met-stroke-active": "#3d3f5e",
      },
      borderRadius: {
        met: "8px",
      },
      boxShadow: {
        "met-hover":
          "0px 8px 32px -6px rgba(126, 111, 222, 0.24), 0px 18px 100px -4px rgba(126, 111, 222, 0.32)",
        "met-card": "0px 4px 12px rgba(32, 32, 49, 0.3)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "count-up": "count-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
