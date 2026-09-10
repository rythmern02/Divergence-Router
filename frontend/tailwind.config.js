/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        card: "#0e0e0e",
        cardBorder: "#222222",
        brandPrimary: "#ffffff",
        brandSuccess: "#f4f4f5",
        brandWarning: "#a1a1aa",
        brandDanger: "#71717a",
      },
    },
  },
  plugins: [],
};
