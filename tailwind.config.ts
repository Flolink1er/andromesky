import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{html,ts}',
  ],

  theme: {
    extend: {
      colors: {
        space: {

          dark: '#07111F',
          panel: '#0F172A',

          blue: '#2563EB',
          glow: '#38BDF8',

          accent: '#FFD166',

          text: '#E2E8F0',
          muted: '#94A3B8',

        }

      }
    },
  },

  plugins: [],
}

export default config
