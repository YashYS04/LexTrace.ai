/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f7',
          100: '#d9eded',
          200: '#b6dede',
          300: '#8ac7c7',
          400: '#5ba9a9',
          500: '#3e8c8c',
          600: '#307070',
          700: '#2a5b5b',
          800: '#254b4b',
          900: '#224040',
        },
      },
    },
  },
  plugins: [],
};
