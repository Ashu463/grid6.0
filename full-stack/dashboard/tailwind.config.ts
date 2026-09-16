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
        ink: withAlpha("ink"),
        surface: withAlpha("surface"),
        raised: withAlpha("raised"),
        line: withAlpha("line"),
        muted: withAlpha("muted"),
        fg: withAlpha("fg"),
        accent: withAlpha("accent"),
        pass: withAlpha("pass"),
        fail: withAlpha("fail"),
        warn: withAlpha("warn"),
      },
      fontFamily: {
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
