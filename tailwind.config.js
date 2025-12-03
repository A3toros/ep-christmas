/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#DC2626',
        accent: '#16A34A',
        gold: '#F59E0B',
        'christmas-red': '#DC2626',
        'christmas-green': '#16A34A',
      },
      fontFamily: {
        display: ['Poppins', 'Inter', 'system-ui'],
        body: ['Inter', 'system-ui'],
      },
    },
  },
  plugins: [],
}

