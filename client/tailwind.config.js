/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17221e',
        paper: '#f5f2ea',
        coral: '#e56b4f',
        mint: '#cfe7d6'
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 34, 30, 0.09)'
      }
    }
  },
  plugins: []
};
