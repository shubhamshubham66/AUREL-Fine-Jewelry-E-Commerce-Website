export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0B0B',
        onyx: '#111111',
        gold: { DEFAULT: '#D4AF37', 50: '#FBF5DC', 100: '#F5E9B0', 200: '#EDDB84', 300: '#E3CB58', 400: '#D4AF37', 500: '#B8952C', 600: '#947623', 700: '#6F591A', 800: '#4A3B11', 900: '#251D08' },
        rosegold: '#B76E79',
        cream: '#F5F5F5',
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 60%)',
        'gold-shine': 'linear-gradient(110deg, transparent 30%, rgba(212,175,55,0.45) 50%, transparent 70%)',
      },
      boxShadow: {
        gold: '0 10px 40px -10px rgba(212,175,55,0.45)',
        'gold-soft': '0 0 30px rgba(212,175,55,0.18)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};
