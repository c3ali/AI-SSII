'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

// Mock data for development
const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Platform',
    brief: 'Build a modern e-commerce platform with Next.js',
    status: 'SUCCESS',
    stack: 'NEXTJS',
    createdAt: new Date().toISOString(),
    plan: {
      overview: 'Full-stack e-commerce with payment integration',
      features: ['Product catalog', 'Shopping cart', 'Stripe payments']
    }
  },
  {
    id: '2',
    name: 'Mobile Task Manager',
    brief: 'Create a productivity app for task management',
    status: 'RUNNING',
    stack: 'REACT_NATIVE',
    createdAt: new Date().toISOString(),
  }
]

export default function DevDashboardPage() {
  const [projects, setProjects] = useState(mockProjects)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: 'default',
      QUEUED: 'info',
      RUNNING: 'warning',
      SUCCESS: 'success',
      FAILED: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getStackIcon = (stack: string) => {
    const icons: Record<string, string> = {
      NEXTJS: '⚛️',
      REACT_NATIVE: '📱',
      EXPO: '🚀',
      NUXT: '💚',
      FLUTTER: '🎯',
    }
    return icons[stack] || '🔧'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">
              🔧 MODE DÉVELOPPEMENT - Authentification désactivée
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
              <p className="text-gray-600 mt-1">Projets générés par l&apos;IA</p>
            </div>
            <Link href="/dev/new">
              <Button>+ Nouveau Projet</Button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/dev/projects/${project.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getStackIcon(project.stack)}</span>
                        {getStatusBadge(project.status)}
                      </div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {project.brief}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{project.stack}</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
