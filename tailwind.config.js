/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#101318',
        'bg-card': '#191d24',
        'accent-orange': '#ff8833',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(.4,0,.6,1) infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, to': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%, to': { boxShadow: '0 0 20px #ff88334d' },
          '50%': { boxShadow: '0 0 40px #ff8833' },
        },
      },
    },
  },
  plugins: [],
}
