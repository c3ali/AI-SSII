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
        {/* Animated grid background */}
        <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />

        {/* Gradient orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Navigation />
        <main className="relative container mx-auto px-4 py-8 md:py-16">
          {children}
        </main>
      </body>
    </html>
  )
}
