module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",       // Scan routes
    "./components/**/*.{js,jsx,ts,tsx}"  // Scan UI components
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        zinc: {
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
      },
    },
  },
  plugins: [],
}