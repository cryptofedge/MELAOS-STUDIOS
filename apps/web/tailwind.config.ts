import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        melaos: {
          orange: '#F28C28',
          pink: '#E91E8C',
          purple: '#7C3AED',
          deepPurple: '#6A0572',
          magenta: '#AE06ED',
          blue: '#007AFF',
          bg: '#0A0A0A',
          card: '#1A1A1A',
          border: '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'waveform': 'waveform 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(242,140,40,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(242,140,40,0.8), 0 0 60px rgba(233,30,140,0.4)' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.5)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
};

export default config;
