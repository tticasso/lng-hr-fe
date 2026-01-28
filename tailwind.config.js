/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#EFF6FF",
        },
        secondary: "#6B7280",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
        },
        border: "#E5E7EB",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
