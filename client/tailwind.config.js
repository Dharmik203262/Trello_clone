/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Trello purple theme color palette
        'trello-purple': '#7B68C4',
        'trello-purple-dark': '#5E4DB2',
        'trello-purple-light': '#9B8ED9',
        'board-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'trello-blue': '#0079bf',
        'trello-dark-blue': '#026AA7',
        'trello-light-blue': '#00C2E0',
        'trello-green': '#61BD4F',
        'trello-yellow': '#F2D600',
        'trello-orange': '#FF9F1A',
        'trello-red': '#EB5A46',
        'trello-purple-label': '#C377E0',
        'trello-pink': '#FF78CB',
        'trello-lime': '#51E898',
        'trello-sky': '#00C2E0',
        'trello-gray': '#B3BAC5',
        'card-bg': '#FFFFFF',
        'card-bg-dark': '#2D2E37',
        'list-bg': '#EBECF0',
        'list-bg-dark': 'rgba(0, 0, 0, 0.25)',
        'board-bg': '#667eea',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'trello-purple-gradient': 'linear-gradient(135deg, #7b68c4 0%, #5e4db2 100%)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans', 'Ubuntu', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 0 rgba(9,30,66,.13)',
        'card-hover': '0 4px 8px -2px rgba(9,30,66,.25), 0 0 0 1px rgba(9,30,66,.08)',
        'card-dark': '0 1px 2px rgba(0,0,0,0.3)',
        'card-dark-hover': '0 4px 12px rgba(0,0,0,0.4)',
        'list': '0 1px 2px rgba(0,0,0,0.12)',
        'list-dark': '0 2px 8px rgba(0,0,0,0.4)',
        'modal': '0 8px 16px -4px rgba(9,30,66,.25), 0 0 0 1px rgba(9,30,66,.08)',
      },
      borderRadius: {
        'card': '3px',
        'list': '12px',
      }
    },
  },
  plugins: [],
}
