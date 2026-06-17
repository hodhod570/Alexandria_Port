/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tac: {
          950:   '#010409',
          900:   '#0b1120',
          800:   '#0d1b2e',
          700:   '#112240',
          600:   '#1a3a5c',
          500:   '#1e4976',
          cyan:  '#00f2ff',
          red:   '#ff0055',
          green: '#00ff9d',
          amber: '#ffaa00',
          blue:  '#0066ff',
          muted: '#1e3a5f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        orb:  ['Orbitron', 'monospace'],
      },
      boxShadow: {
        'glow-cyan':  '0 0 16px rgba(0,242,255,0.35), 0 0 48px rgba(0,242,255,0.12)',
        'glow-red':   '0 0 16px rgba(255,0,85,0.45),  0 0 40px rgba(255,0,85,0.15)',
        'glow-green': '0 0 16px rgba(0,255,157,0.35), 0 0 40px rgba(0,255,157,0.1)',
        'glow-amber': '0 0 16px rgba(255,170,0,0.35)',
        'glass':      '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,242,255,0.06)',
        'glass-sm':   '0 4px 16px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'grid-tac': "linear-gradient(rgba(0,242,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-tac': '40px 40px',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'scan-line':    'scanLine 4s linear infinite',
        'blink':        'blink 1s step-start infinite',
        'enter-up':     'enterUp 0.4s ease forwards',
        'enter-fade':   'enterFade 0.5s ease forwards',
        'stream-in':    'streamIn 0.3s ease forwards',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        enterUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        enterFade: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        streamIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 8px rgba(0,242,255,0.4)' },
          '50%':     { boxShadow: '0 0 24px rgba(0,242,255,0.8), 0 0 48px rgba(0,242,255,0.3)' },
        },
      },
    },
  },
  plugins: [],
};
