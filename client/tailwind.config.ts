import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
  screens: {
    'sm': '480px',     // Recommended mobile breakpoint
    'tablet': '768px',
    'laptop': '1024px',
    'desktop': '1280px',
  },
}


    extend: {},
  },

  plugins: [],
};

export default config;