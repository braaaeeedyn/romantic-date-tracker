/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // These are fallbacks in case CSS variables aren't available
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-dark': 'rgb(var(--color-primary-dark) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        
        // Theme colors with proper fallbacks
        'romantic-lilac': '#B399D4',
        'romantic-mauve': '#C4A7C9',
        'romantic-rose': '#FFA5AB',
        'romantic-peach': '#FFB7B2',
        'romantic-lavender': '#D10047', // Deep love red
        'romantic-coral': '#FF7E79',
        'romantic-sky': '#89CFF0',
        'romantic-mint': '#A2E4B8',
        'romantic-cream': '#FFF9F9',
        'romantic-dark': '#4A2D32',
        'romantic-light': '#FFF5F5',
        'romantic-primary': 'var(--color-romantic-primary, #B399D4)',
        'romantic-secondary': 'var(--color-romantic-secondary, #C4A7C9)',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['"Nunito Sans"', 'sans-serif'],
      },
      boxShadow: {
        'romantic': '0 4px 20px -5px rgba(255, 182, 193, 0.4)',
      },
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}
