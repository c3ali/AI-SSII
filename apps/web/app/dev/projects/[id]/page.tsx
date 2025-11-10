'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '@/components/ui'

interface Project {
  id: string
  name: string
  brief: string
  status: string
  stack: string
  createdAt: string
  plan: {
    overview: string
    phases: Array<{
      name: string
      duration: string
      tasks: string[]
    }>
    architecture: {
      [key: string]: string
    }
    estimations: {
      duration: string
      complexity: string
      team: string
    }
    techStack?: string[]
    risks?: string[]
    recommendations?: string[]
  }
}

export default function DevProjectPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load project from localStorage
    if (typeof window !== 'undefined') {
      const projects = JSON.parse(localStorage.getItem('ai_projects') || '[]')
      const foundProject = projects.find((p: Project) => p.id === params.id)
      setProject(foundProject || null)
      setLoading(false)
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Projet non trouvé</h1>
          <Link href="/dev">
            <Button>← Retour au Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">
            ✅ Plan généré par GPT-4
          </p>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Link href="/dev">
            <Button variant="outline" className="mb-4">← Retour</Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-2">{project.brief}</p>
              <div className="flex gap-3 mt-4">
                <Badge variant="success">{project.status}</Badge>
                <Badge variant="info">{project.stack}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        {project.plan.overview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📖 Vue d&apos;ensemble</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{project.plan.overview}</p>
            </CardContent>
          </Card>
        )}

        {/* Estimations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-gray-900">
                {project.plan.estimations.duration}
              </div>
              <div className="text-sm text-gray-600">Durée estimée</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-900">
                {project.plan.estimations.complexity}
              </div>
              <div className="text-sm text-gray-600">Complexité</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-2xl font-bold text-gray-900">
                {project.plan.estimations.team}
              </div>
              <div className="text-sm text-gray-600">Équipe requise</div>
            </CardContent>
          </Card>
        </div>

        {/* Phases */}
        {project.plan.phases && project.plan.phases.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📋 Plan de Développement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {project.plan.phases.map((phase, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {phase.name} <span className="text-sm text-gray-500">({phase.duration})</span>
                    </h3>
                    <ul className="space-y-1">
                      {phase.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} className="text-gray-700 flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Architecture */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🏗️ Architecture Technique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(project.plan.architecture).map(([key, value]) => (
                <div key={key}>
                  <h4 className="font-semibold mb-2 capitalize">{key}</h4>
                  <p className="text-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        {project.plan.techStack && project.plan.techStack.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🛠️ Stack Technologique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.plan.techStack.map((tech, idx) => (
                  <Badge key={idx} variant="info">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risks */}
        {project.plan.risks && project.plan.risks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>⚠️ Risques Identifiés</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.plan.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-yellow-500 mr-2">⚠️</span>
                    <span className="text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {project.plan.recommendations && project.plan.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>💡 Recommandations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.plan.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-2">💡</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
