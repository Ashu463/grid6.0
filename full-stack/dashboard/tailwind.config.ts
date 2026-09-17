import type { Config } from "tailwindcss";

const withAlpha = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: withAlpha("black"),
        panel: withAlpha("panel"),
        panel2: withAlpha("panel2"),
        line: withAlpha("line"),
        yellow: withAlpha("yellow"),
        blue: withAlpha("blue"),
        green: withAlpha("green"),
        red: withAlpha("red"),
        fg: withAlpha("fg"),
        grey: withAlpha("grey"),
      },
      fontFamily: {
        ox: ["Oxanium", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
