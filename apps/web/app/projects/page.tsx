import Link from "next/link"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { ProjectStatus } from "@/types/project"

// Mock data
const projects = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "Full-stack e-commerce solution with payment integration",
    status: ProjectStatus.IN_PROGRESS,
    progress: 65,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Mobile Banking App",
    description: "Secure mobile banking application for iOS and Android",
    status: ProjectStatus.REVIEW,
    progress: 95,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Social Media Dashboard",
    description: "Analytics dashboard for social media management",
    status: ProjectStatus.COMPLETED,
    progress: 100,
    createdAt: "2024-01-05",
  },
]

const statusVariants: Record<ProjectStatus, any> = {
  [ProjectStatus.PENDING]: "secondary",
  [ProjectStatus.IN_PROGRESS]: "default",
  [ProjectStatus.REVIEW]: "warning",
  [ProjectStatus.COMPLETED]: "success",
  [ProjectStatus.FAILED]: "destructive",
  [ProjectStatus.CANCELLED]: "secondary",
}

export default function ProjectsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your AI-generated projects
            </p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <Badge variant={statusVariants[project.status]}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created on {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
