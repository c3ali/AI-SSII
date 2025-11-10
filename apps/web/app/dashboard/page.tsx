'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '@/components/ui'
import { projectsApi } from '@/lib/api/projects'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const response = await projectsApi.list()
      setProjects(response.items)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: 'default',
      QUEUED: 'info',
      RUNNING: 'warning',
      SUCCESS: 'success',
      FAILED: 'danger',
      CANCELLED: 'default',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your AI-generated projects</p>
        </div>
        <Link href="/dashboard/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first AI-powered project to get started
            </p>
            <Link href="/dashboard/new">
              <Button>Create Project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
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
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  {project.budget && (
                    <div className="mt-2 text-xs text-gray-500">
                      Budget: €{project.budget} | Timeline: {project.timeline} days
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
