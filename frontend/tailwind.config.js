/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--primary)',
          accent: 'var(--accent)',
          blue: 'var(--primary)',
          dark: 'var(--primary-dark)',
          yellow: 'var(--accent)',
          card: 'var(--card-bg)',
          text: 'var(--foreground)',
          muted: 'var(--muted)',
          pink: 'var(--accent-pink)',
          lavender: 'var(--accent-lavender)',
        }
      },
      fontFamily: {
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
