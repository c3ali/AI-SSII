import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}
