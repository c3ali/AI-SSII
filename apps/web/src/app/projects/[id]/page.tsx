import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'
import { notFound } from 'next/navigation'

async function getProject(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/${id}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  const statusColors = {
    DRAFT: 'secondary',
    QUEUED: 'outline',
    RUNNING: 'default',
    SUCCESS: 'success',
    FAILED: 'destructive',
    CANCELLED: 'secondary',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-2">
            Créé le {formatDate(project.createdAt)} par {project.user.name}
          </p>
        </div>
        <Badge variant={statusColors[project.status as keyof typeof statusColors] as any}>
          {project.status}
        </Badge>
      </div>

      {/* Main Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.stack}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(project.budget)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.timeline} jours</div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description du Projet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{project.brief}</p>
        </CardContent>
      </Card>

      {/* Metrics */}
      {project.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Métriques</CardTitle>
            <CardDescription>Indicateurs de qualité et performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {project.metrics.coverage && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Couverture de tests</p>
                  <p className="text-2xl font-bold">{project.metrics.coverage}%</p>
                </div>
              )}
              {project.metrics.linesOfCode && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Lignes de code</p>
                  <p className="text-2xl font-bold">{project.metrics.linesOfCode.toLocaleString()}</p>
                </div>
              )}
              {project.metrics.lighthouse && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Score Lighthouse</p>
                  <p className="text-2xl font-bold">{project.metrics.lighthouse}/100</p>
                </div>
              )}
              {project.metrics.vulnerabilities !== null && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Vulnérabilités</p>
                  <p className="text-2xl font-bold">{project.metrics.vulnerabilities}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executions */}
      {project.executions && project.executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exécutions d'Agents</CardTitle>
            <CardDescription>Historique des agents IA exécutés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.executions.map((execution: any) => (
                <div key={execution.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{execution.agent}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(execution.startedAt)}
                      {execution.duration && ` • ${(execution.duration / 1000).toFixed(2)}s`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {execution.tokensUsed && (
                      <span className="text-xs text-muted-foreground">{execution.tokensUsed} tokens</span>
                    )}
                    <Badge variant={
                      execution.status === 'SUCCESS' ? 'success' :
                      execution.status === 'RUNNING' ? 'default' :
                      execution.status === 'FAILED' ? 'destructive' :
                      'secondary'
                    }>
                      {execution.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {(project.githubUrl || project.deployUrl || project.docsUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Liens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.githubUrl && (
                <Link href={project.githubUrl} target="_blank">
                  <Button variant="outline">GitHub</Button>
                </Link>
              )}
              {project.deployUrl && (
                <Link href={project.deployUrl} target="_blank">
                  <Button variant="outline">Déploiement</Button>
                </Link>
              )}
              {project.docsUrl && (
                <Link href={project.docsUrl} target="_blank">
                  <Button variant="outline">Documentation</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
