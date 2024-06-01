import type { Config } from "tailwindcss";
const {fontFamily} = require("tailwindcss/defaultTheme")

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#830709', //maron
        secondary: '#000000ff',
        tertiary: {
          dark: '#830709ff',
          light: '#AE9262ff',
        },
      },
      fontFamily: {
        poppins: ['var(--font-poppins)',...fontFamily.sans],
      }
    },
  },
  plugins: [],
};
export default config;
/*
--lion: #AE9262ff;
--black: #000000ff;
--charcoal: #273A48ff;
--maroon: #830709ff;
*/
