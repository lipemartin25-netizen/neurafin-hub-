import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#03050C', // Very dark blue/black (MetaFin reference)
                foreground: '#ffffff',
                card: {
                    DEFAULT: 'rgba(255, 255, 255, 0.02)',
                    foreground: '#ffffff',
                },
                primary: {
                    DEFAULT: '#00F260', // Neon Emerald
                    foreground: '#000000',
                },
                secondary: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    foreground: '#a1a1aa',
                },
                muted: {
                    DEFAULT: 'rgba(255, 255, 255, 0.1)',
                    foreground: '#71717a',
                },
                accent: {
                    DEFAULT: '#F5A623', // Gold/Amber (AurumFinance reference)
                    foreground: '#000000',
                },
                destructive: {
                    DEFAULT: '#EF4444',
                    foreground: '#ffffff',
                },
                border: 'rgba(255, 255, 255, 0.05)',
                input: 'rgba(255, 255, 255, 0.05)',
                ring: '#00F260',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                lg: '1rem',
                md: '0.75rem',
                sm: '0.5rem',
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar'),
    ],
}

export default config
