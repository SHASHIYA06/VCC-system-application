import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Premium Typography Stack
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Orbitron"', 'monospace'],
        display: ['"Orbitron"', 'monospace'],
      },
      colors: {
        // Premium Dark Theme Color System
        primary: {
          50: '#f0f4ff',
          100: '#e1eaff',
          200: '#c9d8ff',
          300: '#a4beff',
          400: '#7e97ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00d4ff', // Primary accent
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#000014', // Primary background
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.2)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-mesh': 'conic-gradient(from 180deg at 50% 50%, #667eea, #764ba2, #00d4ff, #7c3aed, #667eea)',
        'gradient-cyber': 'linear-gradient(45deg, #ff006e, #fb5607, #ffbe0b, #8338ec, #3a86ff, #06ffa5)',
      },
      animation: {
        // Premium Animations
        'float-gentle': 'floatGentle 6s ease-in-out infinite',
        'float-slow': 'floatGentle 8s ease-in-out infinite',
        'morph': 'morphing 8s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite alternate',
        'holographic': 'holographicShift 3s ease-in-out infinite',
        'grid-pulse': 'gridPulse 4s ease-in-out infinite',
        'particle-float': 'particleFloat 8s linear infinite',
        'mesh-rotate': 'meshRotate 60s linear infinite',
        'background-float': 'backgroundFloat 20s ease-in-out infinite',
        'spin-advanced': 'spinAdvanced 2s linear infinite',
        // Enhanced Standard Animations
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce-in': 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(1deg)' },
          '50%': { transform: 'translateY(-20px) rotate(0deg)' },
          '75%': { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        morphing: {
          '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
          '25%': { borderRadius: '58% 42% 75% 25% / 76% 46% 54% 24%' },
          '50%': { borderRadius: '50% 50% 33% 67% / 55% 27% 73% 45%' },
          '75%': { borderRadius: '33% 67% 58% 42% / 63% 68% 32% 37%' },
        },
        neonPulse: {
          from: { textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' },
          to: { textShadow: '0 0 5px currentColor, 0 0 15px currentColor, 0 0 30px currentColor' },
        },
        holographicShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gridPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-10vh) translateX(200px)', opacity: '0' },
        },
        meshRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        backgroundFloat: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        spinAdvanced: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        // Premium Shadow System
        'glow-sm': '0 0 10px rgba(0, 212, 255, 0.3)',
        'glow': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 212, 255, 0.5)',
        'glow-xl': '0 0 40px rgba(0, 212, 255, 0.6)',
        'glow-accent': '0 0 20px rgba(124, 58, 237, 0.4)',
        'depth': '0 20px 40px rgba(0, 0, 0, 0.3)',
        'depth-lg': '0 30px 60px rgba(0, 0, 0, 0.4)',
        'glass': '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'premium': '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '64px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        'premium': '24px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms') as any,
    require('@tailwindcss/typography') as any,
    require('@tailwindcss/aspect-ratio') as any,
  ],
  darkMode: 'class',
};

export default config;
