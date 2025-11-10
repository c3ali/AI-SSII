"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ProjectStatus } from "@/types/project"

// Mock data
const recentProjects = [
  {
    id: "1",
    name: "E-commerce Platform",
    status: ProjectStatus.IN_PROGRESS,
    progress: 65,
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Mobile Banking App",
    status: ProjectStatus.REVIEW,
    progress: 95,
    updatedAt: "5 hours ago",
  },
  {
    id: "3",
    name: "Social Media Dashboard",
    status: ProjectStatus.COMPLETED,
    progress: 100,
    updatedAt: "1 day ago",
  },
  {
    id: "4",
    name: "CRM System",
    status: ProjectStatus.IN_PROGRESS,
    progress: 30,
    updatedAt: "2 days ago",
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

export function RecentProjects() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {project.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {project.updatedAt}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {project.progress}%
                  </span>
                  <Badge variant={statusVariants[project.status]}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
