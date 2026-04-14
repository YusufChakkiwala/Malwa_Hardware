/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        slateCoal: '#f5f9ff',
        steel: '#1f2937',
        ember: '#f97316',
        mist: '#0f172a'
      },
      boxShadow: {
        industrial: '0 18px 40px rgba(15, 23, 42, 0.12)'
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      }
    }
  },
  plugins: []
};
