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
        brand: {
          blue: '#2563eb',
          blueSecondary: '#3a86ff',
          violet: '#a259ff',
          background: {
            dark: '#18122b',
            medium: '#23243a',
            light: '#1a1a2e',
            extra: '#0a0618',
            accent: '#1a1333',
          },
          accent: '#00f2ea',
          green: '#22c55e',
          red: '#e11d48',
          yellow: '#fde68a',
          gray: '#353744',
          white: '#fff',
          black: '#222',
          border: {
            violet: '#7c3aed',
            light: '#a259ff',
            dark: '#23243a',
          },
        },
      },
    },
  },
  plugins: [],
}; 