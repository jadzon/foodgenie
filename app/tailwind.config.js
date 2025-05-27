/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets:[require("nativewind/preset")],
  theme: {
    extend: {
       colors: {
        'brand-pink': '#f7438d',
        'raisin-black':'#25242A',
        'night':'#131316'
      },
    },
  },
  plugins: [],
}

