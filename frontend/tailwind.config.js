/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0a0a0a',
        'surface-hover': '#111111',
        border: '#222222',
        'border-subtle': '#181818',
        'text-primary': '#ffffff',
        'text-secondary': '#888888',
        'text-tertiary': '#666666',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
