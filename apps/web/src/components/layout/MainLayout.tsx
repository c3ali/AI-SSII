import { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { NeuralBackground } from './NeuralBackground'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-deep-space text-white">
      <NeuralBackground />
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
    </div>
  )
}
