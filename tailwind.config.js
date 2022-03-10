module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        overpass: "'Bebas Neue', cursive",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
