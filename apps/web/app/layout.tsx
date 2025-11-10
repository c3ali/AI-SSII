import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SSII IA Platform - AI-Powered Project Generation',
  description: 'Generate complete software projects with AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
