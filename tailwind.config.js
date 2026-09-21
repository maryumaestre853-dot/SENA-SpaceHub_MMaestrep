/** @type {import('tailwindcss').Config} */
// =================================================================
// PALETA "SENA SPACEHUB · AZUL PETRÓLEO & TURQUESA"
// Basada en la referencia entregada: fondos azul petróleo,
// acentos turquesa, superficies celeste claro y texto blanco.
// =================================================================
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        spacehub: {
          deep: "#003A45",
          darker: "#002B33",
          teal: "#16A6B6",
          tealLight: "#5DD4D2",
          cyan: "#79DDE0",
          pale: "#B9E2E8",
          white: "#EAF6F8",
          border: "#238895",
        },

        sena: {
          green: "#16A6B6",
          dark: "#003A45",
          lightGreen: "#EAF6F8",
          accent: "#5DD4D2",
          gray: "#B9E2E8",
          blue: "#B9E2E8",
        },

        // Neutros adaptados al azul petróleo de la referencia
        slate: {
          50: "#F3FCFD",
          100: "#EAF6F8",
          200: "#D5EEF1",
          300: "#B9E2E8",
          400: "#8FC8CE",
          500: "#79AEB5",
          600: "#4D8D96",
          700: "#2F737D",
          800: "#1D6670",
          900: "#003A45",
          950: "#002B33",
        },

        // Acento principal: turquesa
        emerald: {
          200: "#C8F1F0",
          300: "#9BE5E3",
          400: "#72D9D7",
          500: "#16A6B6",
          600: "#22B7C4",
          700: "#0B6673",
          800: "#07515D",
          900: "#043F49",
          950: "#022F37",
        },

        // Acento secundario: celeste
        sky: {
          200: "#EAF6F8",
          300: "#D5EEF1",
          400: "#B9E2E8",
          500: "#B9E2E8",
          600: "#8FC8CE",
          700: "#4D8D96",
          800: "#2F737D",
          900: "#1D6670",
          950: "#0F4D56",
        },

        // Advertencias en tonos turquesa/celeste para conservar la estética
        amber: {
          200: "#D8F3F2",
          300: "#B8E8E7",
          400: "#8ED8D8",
          500: "#63C8CB",
          600: "#3DB2BC",
          700: "#238895",
          800: "#176875",
          900: "#0F4D56",
          950: "#093B43",
        },

        // Alertas con contraste, manteniendo la familia fría
        rose: {
          200: "#D5F0F2",
          300: "#B7E1E5",
          400: "#8CCDD3",
          500: "#62B9C2",
          600: "#3D9DA8",
          700: "#287E89",
          800: "#1C626C",
          900: "#124B53",
          950: "#0B373E",
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
