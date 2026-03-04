import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './force-styles.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

export const viewport: Viewport = {
    themeColor: '#c9a858',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
}

export const metadata: Metadata = {
    title: {
        default: 'AurumFinance | Gestão de Elite',
        template: '%s | AurumFinance',
    },
    description: 'Plataforma premium de gestão financeira pessoal com IA',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'AurumFin',
    },
    formatDetection: {
        telephone: false,
    },
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'msapplication-TileColor': '#0b0d10',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" className="dark" style={{ backgroundColor: '#0b0d10', colorScheme: 'dark' }}>
            <head>
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
            </head>
            <body
                className={`${inter.variable} font-sans`}
                style={{
                    backgroundColor: '#0b0d10',
                    color: '#ebe6da',
                    minHeight: '100vh',
                    margin: 0,
                    overscrollBehavior: 'none',
                }}
            >
                {children}
            </body>
        </html>
    )
}
