/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#f7f3ed',
          100: '#e8e1d5',
          200: '#d5c3ae',
          300: '#c2a587',
          400: '#b08761',
          500: '#9d6b3c',
          600: '#8d5d34',
          700: '#744c2c',
          800: '#5e3d24',
          900: '#4c311d',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e2e8e2',
          200: '#c5d1c5',
          300: '#a7b9a7',
          400: '#89a189',
          500: '#6b896b',
          600: '#5c755c',
          700: '#4c614c',
          800: '#3d4d3d',
          900: '#313e31',
        },
        clay: {
          50: '#fbf7f5',
          100: '#f3e9e4',
          200: '#e7d3c9',
          300: '#dbbdae',
          400: '#cfa793',
          500: '#c39178',
          600: '#b47b5d',
          700: '#96654d',
          800: '#78513e',
          900: '#614132',
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        scaleIn: 'scaleIn 0.5s ease-in-out',
        scanLine: 'scanLine 3s ease-in-out infinite',
        bounce: 'bounce 1s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        slideUp: 'slideUp 0.5s ease-out',
        slideDown: 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
};