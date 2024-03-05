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
    themes: ["light", "dark", "garden"],
  }
}

