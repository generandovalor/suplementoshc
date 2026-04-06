export default {
  content: [
    './index.html',
    './src/**/*.{js,html}'
  ],
  theme: {
    extend: {
      colors: {
        hc: {
          neon: '#B7F000',
          neonhover: '#A3E635',
          purple: '#7C3AED',
          purplehover: '#6D28D9',
          dark: '#0F172A'
        }
      },
      boxShadow: {
        floating: '0 10px 25px -5px rgba(0,0,0,.18), 0 8px 10px -6px rgba(0,0,0,.15)'
      }
    }
  },
  plugins: []
};
