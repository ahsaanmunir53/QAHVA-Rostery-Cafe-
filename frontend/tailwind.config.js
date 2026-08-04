/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#241610',
        roast: '#33221A',
        mocha: '#4A3426',
        cream: '#F5ECDF',
        foam: '#FBF6EC',
        latte: '#E8D8C2',
        gold: '#C9A26B',
        copper: '#A9683F',
        smoke: '#8C7A6B',
        line: '#E6DAC8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { label: '0.22em' },
    },
  },
  plugins: [],
};
