/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      spacing: {
        '6': '1.5rem',
      },
    },
  },
  plugins: [],
} 