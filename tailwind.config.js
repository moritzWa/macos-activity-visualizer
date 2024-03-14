/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  plugins: [],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "dark-bg": "#232329",
        "dark-text": "#d4d4da",
      },
    },
  },
};
