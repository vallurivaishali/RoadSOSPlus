/**
 * Root layout — sets up fonts, React Query provider, and global styles.
 */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'RoadSOS+ | AI-Powered Road Safety Platform',
    template: '%s | RoadSOS+',
  },
  description:
    'Report accidents, detect high-risk zones, and keep roads safer with AI-powered road safety analytics.',
  keywords: ['road safety', 'accident reporting', 'risk zones', 'traffic safety'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
