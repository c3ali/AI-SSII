import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'AI-SSII - AI-Powered Application Builder',
  description: 'Transform your ideas into fully functional applications with AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-deep-space text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
