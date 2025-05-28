/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets:[require("nativewind/preset")],
  theme: {
    extend: {
       colors: {
        'brand-pink': '#f7438d',
        'raisin-black':'#25242A',
        'jet':"#2A2A2A",
        'onyx':"#3D3D3D",
        'night':'#131316'
      },
      fontFamily: {
          exo2: ['Exo2', 'sans-serif'],
          'exo2-bold': ['Exo2-Bold', 'sans-serif'],
          'exo2-semibold': ['Exo2-SemiBold', 'sans-serif'],
          'exo2-italic': ['Exo2-Italic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

