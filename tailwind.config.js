/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'projects/demo/src/**/*.{html,ts}'
  ],
  plugins: [
    require("@tailwindcss/typography"),
    require('@tailwindcss/container-queries'),
    require('daisyui')
  ],
  daisyui: {
    themes: [ "garden", "night"]
  },
  darkMode: ['selector', '[data-theme="night"]'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch', // add required value here
          }
        }
      }
    },
  }
}

