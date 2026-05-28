/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        'p-orange':         '#F26522',
        'p-orange-deep':    '#D8541A',
        'p-orange-soft':    '#FFE7D6',
        'p-orange-faint':   '#FFF4EC',
        'p-blue':           '#2563EB',
        'p-blue-deep':      '#1D4FBF',
        'p-blue-soft':      '#E0EBFF',
        'p-blue-faint':     '#F0F5FF',
        'p-ink':            '#0A0A0A',
        'p-ink-mid':        '#525252',
        'p-ink-soft':       '#8A8A8A',
        'p-ink-faint':      '#C7C7C7',
        'p-line':           '#E6E6E6',
        'p-surface':        '#FFFFFF',
        'p-surface-alt':    '#FAFAFA',
        'p-surface-sunken': '#F4F4F4',
        'p-dark':           '#0A0A0A',
      },
    },
  },
  plugins: [],
}
