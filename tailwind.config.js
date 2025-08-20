/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'courtroom': {
          'wood': '#8B4513',
          'darkwood': '#654321',
          'leather': '#3C2414',
          'brass': '#B87333',
          'marble': '#F5F5DC',
        }
      }
    },
  },
  plugins: [],
}