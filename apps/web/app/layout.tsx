import type { Metadata } from 'next'
import './globals.css'

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
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
