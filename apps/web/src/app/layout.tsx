import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/navigation'

export const metadata: Metadata = {
  title: 'SSII IA Platform',
  description: 'AI-powered platform for software project management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
