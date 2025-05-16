module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // azul principal
          foreground: '#fff',
        },
        secondary: {
          DEFAULT: '#7c3aed', // violeta
          foreground: '#fff',
        },
      },
    },
  },
  plugins: [],
}; 