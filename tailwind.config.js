module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  plugins: [],
  darkMode: "class",
  theme: {
    extend: {
      backgroundColor: {
        "dark-bg": "#232329",
        "dark-bg-secondary": "#131316",
      },
      textColor: {
        "dark-text": "#d4d4da",
        "dark-text-secondary": "#b9bbbe",
      },
      borderColor: {
        "dark-border": "#2a2a31",
      },
    },
  },
};
