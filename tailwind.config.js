/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'projects/demo/src/**/*.{html,ts}'
  ],
  plugins: [
    require('@tailwindcss/container-queries'),
    require('daisyui')
  ],
  daisyui: {
    themes: [ "garden", "night"]
  },
  darkMode: ['selector', '[data-theme="night"]']
}

