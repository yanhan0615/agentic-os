/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'macos-bg': 'rgba(30, 30, 30, 0.85)',
        'macos-border': 'rgba(255, 255, 255, 0.1)',
        'macos-glass': 'rgba(255, 255, 255, 0.08)',
      },
      backdropBlur: {
        macos: '20px',
      },
      boxShadow: {
        window: '0 22px 70px rgba(0, 0, 0, 0.56)',
        dock: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
