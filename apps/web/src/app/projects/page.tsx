import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'

async function getProjects() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            Gérez tous vos projets de développement
          </p>
        </div>
        <Link href="/projects/new">
          <Button>Nouveau Projet</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Aucun projet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Commencez par créer votre premier projet
              </p>
              <Link href="/projects/new">
                <Button className="mt-4">Créer un projet</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={
                      project.status === 'SUCCESS' ? 'success' :
                      project.status === 'RUNNING' ? 'default' :
                      project.status === 'FAILED' ? 'destructive' :
                      'secondary'
                    }>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.brief}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Stack:</span>
                      <Badge variant="outline">{project.stack}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="font-medium">{project.timeline} jours</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground text-xs">
                        {formatDate(project.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project._count.executions} exécutions
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
