/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3b82f6',
          'blue-glow': '#60a5fa',
          green: '#22c55e',
          'green-glow': '#4ade80',
          amber: '#f59e0b',
          saffron: '#ea580c',
        },
        surface: {
          dark: '#090d16',
          card: '#111827',
          elevated: '#1e293b',
          border: '#334155',
        }
      },
      boxShadow: {
        // Soft UI / tactile extruded physical button shadows
        'soft-out': '6px 6px 14px rgba(0, 0, 0, 0.45), -4px -4px 10px rgba(255, 255, 255, 0.04)',
        'soft-in': 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
        'soft-out-light': '6px 6px 14px rgba(160, 175, 200, 0.35), -6px -6px 14px rgba(255, 255, 255, 0.9)',
        'soft-in-light': 'inset 3px 3px 6px rgba(160, 175, 200, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.9)',
        'glow-blue': '0 0 25px -4px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 25px -4px rgba(34, 197, 94, 0.5)',
        'glow-mic': '0 0 35px 6px rgba(59, 130, 246, 0.45), 0 0 15px rgba(34, 197, 94, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s infinite ease-out',
        'wave': 'wave 1.2s infinite ease-in-out',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '1', boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' },
          '70%': { transform: 'scale(1.05)', opacity: '0.8', boxShadow: '0 0 0 24px rgba(59, 130, 246, 0)' },
          '100%': { transform: 'scale(0.95)', opacity: '1', boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
        },
        wave: {
          '0%, 100%': { height: '12px' },
          '50%': { height: '36px' },
        }
      }
    },
  },
  plugins: [],
};
