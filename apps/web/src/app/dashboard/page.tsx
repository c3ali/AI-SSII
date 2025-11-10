'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Folder, Clock, TrendingUp, Activity, CheckCircle, XCircle, PlayCircle } from 'lucide-react'
import { getStatusColor, formatRelativeTime, getAgentIcon } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types'

export default function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      brief: 'A modern e-commerce platform with cart, payments, and admin dashboard',
      status: 'RUNNING' as ProjectStatus,
      stack: 'NEXTJS',
      budget: 5000,
      timeline: 14,
      userId: 'user1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'SaaS Dashboard',
      brief: 'Analytics dashboard with charts, user management, and billing',
      status: 'SUCCESS' as ProjectStatus,
      stack: 'NUXT',
      budget: 3000,
      timeline: 7,
      userId: 'user1',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Mobile Fitness App',
      brief: 'Cross-platform fitness tracking app with workout plans and progress monitoring',
      status: 'DRAFT' as ProjectStatus,
      stack: 'REACT_NATIVE',
      budget: 4000,
      timeline: 10,
      userId: 'user1',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ])

  const stats = [
    { label: 'Total Projects', value: '3', icon: <Folder className="w-5 h-5" />, color: 'electric-blue' },
    { label: 'In Progress', value: '1', icon: <Activity className="w-5 h-5" />, color: 'warning-amber' },
    { label: 'Completed', value: '1', icon: <CheckCircle className="w-5 h-5" />, color: 'success-green' },
    { label: 'Success Rate', value: '100%', icon: <TrendingUp className="w-5 h-5" />, color: 'code-purple' },
  ]

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      case 'RUNNING':
        return <PlayCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold font-display mb-2">Dashboard</h1>
              <p className="text-gray-400 text-lg">Manage your AI-generated projects</p>
            </div>
            <Link href="/projects/new">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} hover={false}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`feature-icon bg-gradient-to-br from-${stat.color} to-${stat.color}/80`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-display mb-6">Your Projects</h2>

          {projects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-gray-400 mb-6">Create your first AI-generated project to get started</p>
                <Link href="/projects/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                      <Badge variant={getStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{project.status}</span>
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.brief}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Stack:</span>
                        <span className="font-medium">{project.stack}</span>
                      </div>
                      {project.budget && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Budget:</span>
                          <span className="font-medium">${project.budget}</span>
                        </div>
                      )}
                      {project.timeline && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Timeline:</span>
                          <span className="font-medium">{project.timeline} days</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="font-medium text-xs">{formatRelativeTime(project.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link href={`/projects/${project.id}`} className="w-full">
                      <Button variant="ghost" size="sm" className="w-full">
                        View Details →
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold font-display mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { agent: 'DEVELOPER', message: 'Completed frontend implementation', time: '2 hours ago', project: 'E-commerce Platform' },
                  { agent: 'QA', message: 'All tests passed successfully', time: '5 hours ago', project: 'SaaS Dashboard' },
                  { agent: 'SECURITY', message: 'Security audit completed', time: '1 day ago', project: 'SaaS Dashboard' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="text-2xl">{getAgentIcon(activity.agent)}</div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-electric-blue">{activity.project}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
