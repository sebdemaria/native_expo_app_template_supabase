/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                ink: {
                    900: "#18211D",
                    950: "#0D1511",
                },
                lime: {
                    300: "#C7F36B",
                },
            },
        },
    },
    plugins: [],
};
