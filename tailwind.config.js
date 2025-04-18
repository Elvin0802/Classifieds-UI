/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
        secondary: '#ffed4a',
        danger: '#e3342f',
        success: '#38c172',
        info: '#6574cd',
        warning: '#f6993f',
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#3490dc",
          "secondary": "#ffed4a",
          "accent": "#6574cd",
          "neutral": "#2a2e37",
          "base-100": "#ffffff",
          "info": "#6574cd",
          "success": "#38c172",
          "warning": "#f6993f",
          "error": "#e3342f",
        },
      },
    ],
  },
} 