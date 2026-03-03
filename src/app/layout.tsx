import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './force-styles.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: {
        default: 'AurumFinance | Gestão de Elite',
        template: '%s | AurumFinance',
    },
    description: 'Plataforma premium de gestão financeira com IA',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" className="dark" style={{ backgroundColor: '#0b0d10', colorScheme: 'dark' }}>
            <body
                className={`${inter.variable} font-sans`}
                style={{
                    backgroundColor: '#0b0d10',
                    color: '#ebe6da',
                    minHeight: '100vh',
                    margin: 0,
                }}
            >
                {children}
            </body>
        </html>
    )
}
