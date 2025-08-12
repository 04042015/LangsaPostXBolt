/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffcccc',
          300: '#ffaaaa',
          400: '#ff7777',
          500: '#ff4f4f',
          600: '#e63946',
          700: '#cc2936',
          800: '#a61e2a',
          900: '#8b1a1f',
        },
      },
      animation: {
        'scroll': 'scroll 30s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};