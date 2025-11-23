import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-nunito)', 'sans-serif'],
        kids: ['var(--font-fredoka)', 'sans-serif'],
        display: ['var(--font-fredoka)', 'sans-serif'],
      },
      colors: {
        scandi: {
          cream: '#FDFBF7',
          oat: '#F3EFE0',
          sand: '#E6DCC3',
          stone: '#A8A29E',
          chocolate: '#5D4037',
          honey: '#F4C95D',
          clay: '#E79E85',
          sage: '#9CAF88',
          moss: '#5F714F',
          denim: '#6B8CA3',
          blush: '#F2D7D5',
          lavender: '#D7D3E2'
        },
        early: {
          bg: '#FDFBF7',
          primary: '#F4C95D',
          secondary: '#E79E85',
          accent: '#F2D7D5',
          text: '#5D4037',
        },
        disco: {
          bg: '#F3EFE0',
          primary: '#9CAF88',
          secondary: '#6B8CA3',
          accent: '#D7D3E2',
          text: '#2C3E50',
        },
        junior: {
          bg: '#EAEBE6',
          surface: '#FFFFFF',
          primary: '#5F714F',
          secondary: '#6B8CA3',
          accent: '#A8A29E',
          text: '#1F2937',
        }
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 4s ease-in-out infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(93, 64, 55, 0.05)',
        'soft-lg': '0 10px 25px -5px rgba(93, 64, 55, 0.08)',
        'toy': '0 4px 0 #E5E7EB',
        'toy-active': '0 0 0 #E5E7EB',
      },
      dropShadow: {
        'soft-lg': '0 10px 25px -5px rgba(93, 64, 55, 0.15)',
      }
    },
  },
  plugins: [],
} satisfies Config
