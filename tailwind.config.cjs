/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      backgroundImage: {
        'tile-pattern': "url('src/assets/images/pattern.svg')"
      },
      backgroundColor: {
        primary: '#4a5549',
        secondary: '#a69f88'
      },
      textColor: {
        primary: '#4a5549',
        secondary: '#a69f88'
      },
      fontFamily: {
        logo: ['Yatra One', 'cursive'],
        body: ['Lato', 'sans-serif']
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
