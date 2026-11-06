import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#131313',
        surface: '#161B22',
        accent: '#D5FF3F',
        text: '#F0F0F0',
        muted: '#8B949E',
      },
      fontFamily: {
        display: [
          'Impact',
          '"Arial Narrow"',
          '"Roboto Condensed"',
          'sans-serif',
        ],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        panel: '1.5rem',
      },
      boxShadow: {
        panel: '0 1.5rem 4rem rgba(0, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config
