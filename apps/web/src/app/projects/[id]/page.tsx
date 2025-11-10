'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Code,
  Shield,
  Microscope,
  Rocket,
  Target,
  Building,
  Activity,
  FileCode,
  TrendingUp,
  Download
} from 'lucide-react'
import { getStatusColor, getAgentIcon, formatRelativeTime } from '@/lib/utils'
import type { Project, Execution, Metrics, AgentType, ExecutionStatus } from '@/types'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Mock data
  const [project] = useState<Project>({
    id: params.id as string,
    name: 'E-commerce Platform',
    brief: 'A modern e-commerce platform with cart, payments, and admin dashboard. Features include user authentication, product catalog, shopping cart, order management, payment integration, and comprehensive admin tools.',
    status: 'RUNNING',
    stack: 'NEXTJS',
    budget: 5000,
    timeline: 14,
    userId: 'user1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const [executions] = useState<Execution[]>([
    {
      id: '1',
      agent: 'DIRECTOR' as AgentType,
      status: 'SUCCESS' as ExecutionStatus,
      progress: 100,
      input: { task: 'Project planning and coordination' },
      output: { plan: 'Completed project breakdown' },
      projectId: params.id as string,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    },
    {
      id: '2',
      agent: 'ARCHITECT' as AgentType,
      status: 'SUCCESS' as ExecutionStatus,
      progress: 100,
      input: { task: 'System architecture design' },
      output: { architecture: 'Next.js with PostgreSQL and Redis' },
      projectId: params.id as string,
      startedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
    },
    {
      id: '3',
      agent: 'DEVELOPER' as AgentType,
      status: 'RUNNING' as ExecutionStatus,
      progress: 65,
      input: { task: 'Frontend and backend development' },
      projectId: params.id as string,
      startedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      agent: 'SECURITY' as AgentType,
      status: 'PENDING' as ExecutionStatus,
      progress: 0,
      input: { task: 'Security audit' },
      projectId: params.id as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      agent: 'QA' as AgentType,
      status: 'PENDING' as ExecutionStatus,
      progress: 0,
      input: { task: 'Quality assurance testing' },
      projectId: params.id as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      agent: 'DEVOPS' as AgentType,
      status: 'PENDING' as ExecutionStatus,
      progress: 0,
      input: { task: 'Deployment and infrastructure' },
      projectId: params.id as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ])

  const [metrics] = useState<Metrics>({
    id: '1',
    codeCoverage: 85,
    lighthouseScore: 92,
    bundleSize: 245,
    loadTime: 1.8,
    securityScore: 88,
    maintainabilityIndex: 75,
    projectId: params.id as string,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const agentIcons: Record<AgentType, JSX.Element> = {
    DIRECTOR: <Target className="w-5 h-5" />,
    ARCHITECT: <Building className="w-5 h-5" />,
    DEVELOPER: <Code className="w-5 h-5" />,
    SECURITY: <Shield className="w-5 h-5" />,
    QA: <Microscope className="w-5 h-5" />,
    DEVOPS: <Rocket className="w-5 h-5" />,
  }

  const getExecutionStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-success-green" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-error-red" />
      case 'RUNNING':
        return <Activity className="w-4 h-4 text-electric-blue animate-pulse" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold font-display mb-2">{project.name}</h1>
              <p className="text-gray-400 text-lg max-w-3xl">{project.brief}</p>
            </div>
            <Badge variant={getStatusColor(project.status)} className="text-base px-4 py-2">
              {project.status}
            </Badge>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Stack', value: project.stack, icon: <Code className="w-4 h-4" /> },
              { label: 'Budget', value: `$${project.budget}`, icon: <TrendingUp className="w-4 h-4" /> },
              { label: 'Timeline', value: `${project.timeline} days`, icon: <Clock className="w-4 h-4" /> },
              { label: 'Created', value: formatRelativeTime(project.createdAt), icon: <Activity className="w-4 h-4" /> },
            ].map((info, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
                  {info.icon}
                  <span>{info.label}</span>
                </div>
                <div className="font-semibold text-lg">{info.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Executions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Executions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Agent Executions</CardTitle>
                    <CardDescription>Real-time progress of AI agents working on your project</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <div key={execution.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-electric-blue/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="feature-icon w-10 h-10 text-lg">
                            {agentIcons[execution.agent]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{execution.agent} Agent</h4>
                            <p className="text-sm text-gray-400">{execution.input.task}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getExecutionStatusIcon(execution.status)}
                          <Badge variant={getStatusColor(execution.status)} className="text-xs">
                            {execution.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="font-medium">{execution.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              execution.status === 'SUCCESS'
                                ? 'bg-success-green'
                                : execution.status === 'FAILED'
                                ? 'bg-error-red'
                                : execution.status === 'RUNNING'
                                ? 'bg-electric-blue animate-pulse'
                                : 'bg-gray-600'
                            }`}
                            style={{ width: `${execution.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {execution.startedAt
                            ? `Started ${formatRelativeTime(execution.startedAt)}`
                            : 'Not started'}
                        </span>
                        {execution.completedAt && (
                          <span>Completed {formatRelativeTime(execution.completedAt)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Code Files */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Files</CardTitle>
                <CardDescription>Source code and assets generated by AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: 'src/app/page.tsx', type: 'TypeScript', size: '12 KB', icon: '⚛️' },
                    { name: 'src/components/ProductCard.tsx', type: 'TypeScript', size: '8 KB', icon: '📦' },
                    { name: 'src/lib/api.ts', type: 'TypeScript', size: '5 KB', icon: '🔌' },
                    { name: 'prisma/schema.prisma', type: 'Prisma', size: '3 KB', icon: '🗄️' },
                    { name: 'README.md', type: 'Markdown', size: '2 KB', icon: '📄' },
                  ].map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{file.icon}</span>
                        <div>
                          <div className="font-mono text-sm font-medium">{file.name}</div>
                          <div className="text-xs text-gray-500">{file.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-400">{file.size}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Metrics */}
          <div className="space-y-6">
            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Real-time code quality and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Code Coverage', value: metrics.codeCoverage, icon: '📊', color: 'success-green' },
                    { label: 'Lighthouse Score', value: metrics.lighthouseScore, icon: '⚡', color: 'electric-blue' },
                    { label: 'Security Score', value: metrics.securityScore, icon: '🔒', color: 'code-purple' },
                    { label: 'Maintainability', value: metrics.maintainabilityIndex, icon: '🔧', color: 'warning-amber' },
                  ].map((metric, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center">
                          <span className="mr-2">{metric.icon}</span>
                          {metric.label}
                        </span>
                        <span className="text-lg font-bold">{metric.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${metric.color} rounded-full`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Bundle Size</span>
                    <span className="font-semibold">{metrics.bundleSize} KB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Load Time</span>
                    <span className="font-semibold">{metrics.loadTime}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Code
                  </Button>
                  <Button variant="secondary" className="w-full">
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy to Production
                  </Button>
                  <Button variant="ghost" className="w-full text-error-red border-error-red hover:bg-error-red hover:text-white">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
