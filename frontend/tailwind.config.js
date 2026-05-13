/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        army: {
          DEFAULT: "#4B5320",
          dark: "#3c6735",
          light: "#b1b8a7dc",
        },
        sand: "#a0886b",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(56, 69, 61, 0.22)",
      },
    },
  },
  plugins: [],
};
