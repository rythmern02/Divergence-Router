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
        background: "#0b0e14",
        card: "#121722",
        cardBorder: "#1e2638",
        brandPrimary: "#6366f1",
        brandSuccess: "#10b981",
        brandWarning: "#f59e0b",
        brandDanger: "#ef4444",
      },
    },
  },
  plugins: [],
};
