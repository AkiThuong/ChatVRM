const { light, dark } = require("@charcoal-ui/theme");
const { createTailwindConfig } = require("@charcoal-ui/tailwind-config");
/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  darkMode: true,
  content: ["./src/**/*.tsx", "./src/**/*.html"],
  presets: [
    createTailwindConfig({
      version: "v3",
      theme: {
        ":root": light,
      },
    }),
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0E942D",
        "primary-hover": "#08591B",
        "primary-press": "#063D13",
        "primary-disabled": "#063D13",
        secondary: "#3FC2EE",
        "secondary-hover": "#0D7394",
        "secondary-press": "#084559",
        "secondary-disabled": "#084559",
        base: "#BEF9CC",
        "text-primary": "#514062",
      },
      fontFamily: {
        M_PLUS_2: ["Montserrat", "M_PLUS_2", "sans-serif"],
        Montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
