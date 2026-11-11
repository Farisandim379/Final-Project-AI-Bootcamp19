/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/js/**/*.js'],
  theme: {
    extend: {
      /* ---- Design tokens extracted from the Figma source ---- */
      colors: {
        // Surfaces (dark, slightly blue-shifted)
        ink: {
          950: '#0f131d', // page background
          900: '#171b26', // pill / pagination background
          850: '#1c1f2a', // small chip background
          800: '#262a35', // icon tile background
        },
        // Brand accents
        accent: {
          lavender: '#c0c1ff',
          indigo: '#8083ff',
          teal: '#4fdbc8',
          deep: '#0d0096', // text on primary CTA
        },
        // Foreground scale
        fg: {
          primary: '#dfe2f1',
          secondary: '#c7c4d7',
          muted: '#908fa0',
          faint: '#464554',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        shell: '1280px',
        headline: '896px',
        sub: '672px',
      },
      boxShadow: {
        cta: '0 10px 25px -5px rgba(128, 131, 255, 0.3)',
        'dot-teal': '0 0 8px 0 rgba(79, 219, 200, 0.8)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ping-soft': {
          '0%': { transform: 'scale(1)', opacity: '0.75' },
          '70%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'ping-soft': 'ping-soft 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};