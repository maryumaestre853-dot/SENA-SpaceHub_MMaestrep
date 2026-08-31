/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sena: {
          green: "#39A900",
          dark: "#212121",
          lightGreen: "#eef9ea",
          accent: "#F57C00",
          gray: "#f4f4f5",
          blue: "#0284c7",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
