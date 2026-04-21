/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        botanical: {
          bg: "#F9F9F7",
          primary: "#2D463E",
          cream: "#EFE7DA",
          card: "#FFFFFF",
          text: "#1A1C1B",
          muted: "#5B6761",
          line: "#D8DDD7"
        }
      }
    }
  }
};
