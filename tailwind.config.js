/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lego-red': '#FF0000',
        'lego-blue': '#0055BF',
        'lego-yellow': '#FFD500',
        'lego-green': '#008F00',
      },
      spacing: {
        'toolbar': '4rem',
      },
      backdropFilter: {
        'toolbar': 'blur(8px)',
      },
    },
  },
  plugins: [],
}