/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'deep-canvas':     '#0D0D2B',
        'night-indigo':    '#1B2A6B',
        'cobalt-swirl':    '#2E4A9E',
        'gold-star':       '#C9A84C',
        'warm-glow':       '#F5E6A3',
        'violet-star':     '#7B4FBF',
        'aurora-teal':     '#3ABFBF',
        'blush-accent':    '#E8B4D8',
        'starlight-white': '#FAFAFA',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px 2px #C9A84C' },
          '50%':      { boxShadow: '0 0 32px 10px #F5E6A3' },
        },
        'drift': {
          '0%':   { transform: 'translate(0px, 0px)' },
          '25%':  { transform: 'translate(8px, -6px)' },
          '50%':  { transform: 'translate(14px, 4px)' },
          '75%':  { transform: 'translate(4px, 10px)' },
          '100%': { transform: 'translate(0px, 0px)' },
        },
        'shooting': {
          '0%':   { transform: 'translateX(-200px) translateY(0)', opacity: 0 },
          '10%':  { opacity: 1 },
          '90%':  { opacity: 1 },
          '100%': { transform: 'translateX(1400px) translateY(-200px)', opacity: 0 },
        },
        'float-up': {
          '0%':   { transform: 'translateY(0)', opacity: 0.8 },
          '100%': { transform: 'translateY(-400px)', opacity: 0 },
        },
      },
      animation: {
        'pulse-glow':  'pulse-glow 2.5s ease-in-out infinite',
        'drift':       'drift 12s ease-in-out infinite',
        'shooting':    'shooting 3s linear infinite',
        'float-up':    'float-up 4s ease-out infinite',
      },
    },
  },
  plugins: [],
}
