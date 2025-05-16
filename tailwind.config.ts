import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Add commonly used classes that might be dynamically constructed
    {
      pattern: /bg-(pink|sky|violet|amber|emerald|indigo|lime|gray|purple|green|blue|rose|orange)-(100|500|800)/,
    },
    {
      pattern: /text-(pink|sky|violet|amber|emerald|indigo|lime|gray|purple|green|blue|rose|orange)-(100|500|800)/,
    },
    {
      pattern: /from-(pink|sky|violet|amber|emerald|indigo|lime|gray|purple|green|blue|rose|orange)-500/,
    },
    {
      pattern: /to-(pink|sky|violet|amber|emerald|indigo|lime|gray|purple|green|blue|rose|orange)-500/,
    },
  ],
}
export default config 