/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}"
], // Added components path
  presets: [require("nativewind/preset")],
  darkMode: "class", // <--- CRITICAL: Add this line
  theme: {
    extend: {
      fontFamily: {
        space: ["SpaceGrotesk"], // Matches the name we'll use in useFonts
        "space-bold": ["SpaceGroteskBold"],
      },
      colors: {
        background: {
          light: "#ffffff",
          dark: "#0a0a0a",
        },
        surface: { light: "#f9fafb", dark: "#121212" },
        foreground: {
          light: "#171717",
          dark: "#ededed",
        },
      },
    },
  },
  plugins: [],
}