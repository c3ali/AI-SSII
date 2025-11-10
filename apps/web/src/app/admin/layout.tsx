'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Bot, History, Activity, CreditCard } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Agents', href: '/admin/agents', icon: Bot },
  { name: 'Décisions', href: '/admin/decisions', icon: History },
  { name: 'Monitoring', href: '/admin/monitoring', icon: Activity },
  { name: 'Facturation', href: '/admin/billing', icon: CreditCard },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-strong border-r border-white/10">
        <div className="flex h-full flex-col px-4 py-8">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h1 className="font-bold gradient-text">SSII AI Studio</h1>
                <p className="text-xs text-foreground/60">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? 'glass-strong border border-purple-500/50 glow'
                      : 'glass border border-white/5 hover:glass-strong hover:border-white/20'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-purple-400' : 'text-foreground/60 group-hover:text-foreground'}`} />
                  <span className={`font-medium ${isActive ? 'gradient-text' : 'text-foreground/80 group-hover:text-foreground'}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Admin</p>
                  <p className="text-xs text-foreground/60">admin@ssii.ai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
