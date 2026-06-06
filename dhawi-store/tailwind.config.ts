import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          50:  '#FAF5E8',
          100: '#F3E8C9',
          200: '#E8D097',
          300: '#DDB865',
          400: '#C9A84C',
          500: '#A88635',
          600: '#856828',
          700: '#624C1C',
          800: '#3F3010',
          900: '#1C1406',
        },
        obsidian: {
          DEFAULT: '#06040C',
          50:  '#2A2340',
          100: '#1E1830',
          200: '#151020',
          300: '#0E0B18',
          400: '#090612',
          500: '#06040C',
          600: '#040309',
          700: '#020106',
          800: '#010003',
          900: '#000001',
        },
        cream: {
          DEFAULT: '#EDE0C8',
          50:  '#FDFAF5',
          100: '#FAF5EB',
          200: '#F5EDD8',
          300: '#F0E4C5',
          400: '#EDE0C8',
          500: '#D4C4A0',
          600: '#BAA878',
          700: '#9D8A55',
          800: '#7A6B40',
          900: '#574C2C',
        },
      },
      fontFamily: {
        display: [
          'Cormorant Garamond',
          'Georgia',
          'serif',
        ],
        body: [
          'Alexandria',
          'Noto Sans Arabic',
          'sans-serif',
        ],
        mono: [
          'IBM Plex Mono',
          'Courier New',
          'monospace',
        ],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #A88635 50%, #C9A84C 100%)',
        'obsidian-gradient': 'linear-gradient(180deg, #06040C 0%, #0E0B18 100%)',
        'card-gradient': 'linear-gradient(145deg, #0E0B18 0%, #06040C 60%, #1E1830 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201, 168, 76, 0.25)',
        'gold-lg': '0 0 40px rgba(201, 168, 76, 0.35)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(201, 168, 76, 0.2)',
      },
      borderColor: {
        'gold-dim': 'rgba(201, 168, 76, 0.25)',
        'gold-mid': 'rgba(201, 168, 76, 0.5)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(201, 168, 76, 0.2)' },
          '50%':       { boxShadow: '0 0 30px rgba(201, 168, 76, 0.5)' },
        },
      },
      animation: {
        shimmer:    'shimmer 2.5s linear infinite',
        fadeInUp:   'fadeInUp 0.6s ease-out forwards',
        glowPulse:  'glowPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
