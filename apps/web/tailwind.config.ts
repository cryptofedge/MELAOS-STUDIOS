import type { Config } from 'tailwindcss';

// MELAOS design system, built for 13–27 year-olds (see DESIGN.md).
//
// Same brand colors: the logo's orange → pink → magenta gradient is the main
// action color and the glow; cyan marks "live"; everything else is a ramp of
// dark neutral surfaces so the cover art carries the color.
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Listed in full, smallest first: Tailwind emits breakpoints in this
    // order, and a later one wins. Adding `xs` under `extend` appended it
    // after `2xl`, so `xs:` classes overrode `md:`/`lg:` ones on wide screens.
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      // Hover styles only where a pointer can hover, so taps on phones
      // and tablets never leave a control stuck in its hover state.
      hoverable: { raw: '(hover: hover) and (pointer: fine)' },
    },
    extend: {
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
          0: '#08080A',
          1: '#111114',
          2: '#18181C',
          3: '#202026',
          4: '#2A2A31',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.09)',
          soft: 'rgba(255,255,255,0.06)',
          strong: 'rgba(255,255,255,0.16)',
        },
        fog: {
          DEFAULT: '#A1A1AD',
          dim: '#8B8B97',
          faint: '#5C5C68',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        label: '0.06em',
      },
      borderRadius: {
        xs: '10px',
        card: '18px',
        panel: '22px',
      },
      backgroundImage: {
        brand: 'linear-gradient(100deg, #F28C28 0%, #E91E8C 55%, #AE06ED 100%)',
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
