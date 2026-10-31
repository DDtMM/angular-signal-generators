/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '48rem',
            p: { paddingBottom: '0' },
            h1: { paddingTop: '0' },
            h2: { paddingTop: '0' },
            h3: { paddingTop: '0' },
            code: { display: 'inline' },
          }
        }
      }
    },
  }
}

