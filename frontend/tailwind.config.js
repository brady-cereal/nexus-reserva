/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0d14',
          card: 'rgba(16, 22, 34, 0.75)',
          neonGreen: '#00ffcc',
          neonCyan: '#00b8ff',
          neonPurple: '#8a2be2',
          neonPink: '#ff007f'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 184, 255, 0.35)',
        'glow-green': '0 0 20px rgba(0, 255, 204, 0.35)',
        'glow-pink': '0 0 20px rgba(255, 0, 127, 0.35)'
      }
    },
  },
  plugins: [],
}