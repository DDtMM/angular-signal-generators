/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'projects/demo/src/**/*.{html,ts}'
  ],
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["light", "dark"],
  }
}

