'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth'
import { Button } from '@/components/ui'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                SSII IA
              </Link>
            </div>

            <nav className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Projects
              </Link>
              <Link
                href="/dashboard/new"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                New Project
              </Link>

              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
                <span className="text-sm text-gray-700">
                  {user?.name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
