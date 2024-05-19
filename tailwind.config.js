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
        primary: "#0E61AA",
        "primary-hover": "#1281E3",
        "primary-press": "#094171",
        "primary-disabled": "#052039",
        secondary: "#3FC2EE",
        "secondary-hover": "#0D7394",
        "secondary-press": "#084559",
        "secondary-disabled": "#084559",
        base: "#B3D9F9",
        "text-primary": "#052039",
      },
      fontFamily: {
        M_PLUS_2: ["Montserrat", "M_PLUS_2", "sans-serif"],
        Montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
