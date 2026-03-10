/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['12px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '22px' }],
        md: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['40px', { lineHeight: '48px' }],
      },
      colors: {
        notion: {
          'text-primary': '#37352F',
          'text-secondary': '#787774',
          'text-tertiary': '#9B9A97',
          'bg-primary': '#FFFFFF',
          'bg-secondary': '#F7F6F3',
          'bg-tertiary': '#EFEEEB',
          'border': '#E3E2E0',
          'primary': '#2383E2',
          'primary-hover': '#0B6BCB',
          'primary-light': '#E7F3FF',
        },
      },
      boxShadow: {
        'notion-sm': '0 1px 2px rgba(55, 53, 47, 0.08)',
        'notion-md': '0 0 0 1px rgba(55, 53, 47, 0.09), 0 1px 2px rgba(55, 53, 47, 0.08)',
        'notion-lg': '0 0 0 1px rgba(55, 53, 47, 0.09), 0 4px 12px rgba(55, 53, 47, 0.12)',
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '4px',
        lg: '8px',
      },
      transitionDuration: {
        fast: '60ms',
        base: '120ms',
        slow: '200ms',
      },
      spacing: {
        '18': '72px',
        '15': '60px',
      },
    },
  },
  plugins: [],
};
