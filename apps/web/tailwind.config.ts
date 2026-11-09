import type { Config } from 'tailwindcss';

// MELAOS design system.
//
// Same brand colors as before, used with intent: orange is the one signal
// color (actions, active state), pink and magenta carry the logo's gradient
// in small doses, cyan is reserved for "live" readouts. Everything else is
// a ramp of near-black inks and hairline rules.
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '375px',
        // Hover styles only where a pointer can hover, so taps on phones
        // and tablets never leave a control stuck in its hover state.
        hoverable: { raw: '(hover: hover) and (pointer: fine)' },
      },
      colors: {
        melaos: {
          orange: '#F28C28',
          pink: '#E91E8C',
          purple: '#7C3AED',
          deepPurple: '#6A0572',
          magenta: '#AE06ED',
          blue: '#007AFF',
          cyan: '#00FFD1',
          hot: '#FF2D78',
          bg: '#0A0A0A',
          card: '#1A1A1A',
          border: '#333333',
        },
        ink: {
          0: '#050507',
          1: '#0A0A0E',
          2: '#101016',
          3: '#17171F',
          4: '#1F1F29',
        },
        line: {
          DEFAULT: '#22222C',
          soft: '#17171F',
          strong: '#33333F',
        },
        fog: {
          DEFAULT: '#9A9AA6',
          dim: '#6B6B78',
          faint: '#45454F',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        label: '0.18em',
      },
      borderRadius: {
        xs: '2px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      height: {
        nav: 'var(--nav-h)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        waveform: 'waveform 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        ticker: 'ticker 40s linear infinite',
        blink: 'blink 1.6s steps(2, start) infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.5)' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        blink: {
          to: { visibility: 'hidden' },
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
