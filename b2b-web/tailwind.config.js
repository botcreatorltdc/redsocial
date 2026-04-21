/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
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
      },
      borderRadius: {
        xl2: "1.5rem",
        xl3: "2rem"
      },
      boxShadow: {
        botanical: "0 10px 30px rgba(45, 70, 62, 0.08)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "serif"]
      }
    }
  },
  plugins: []
};
