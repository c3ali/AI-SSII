'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/projects', label: 'Projets' },
    { href: '/projects/new', label: 'Nouveau Projet' },
  ]

  return (
    <nav className="border-b border-white/10 glass-strong sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
                <span className="text-lg">🤖</span>
              </div>
              <span className="text-xl font-bold gradient-text">SSII AI Studio</span>
            </Link>
            <div className="flex gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname === link.href
                      ? 'glass-strong border border-purple-500/50 glow gradient-text'
                      : 'text-foreground/60 hover:text-foreground hover:glass'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg glass border border-white/10">
              <span className="text-sm text-foreground/80 font-medium">Demo User</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
