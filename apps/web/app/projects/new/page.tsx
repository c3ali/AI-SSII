"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/useToast"
import { useProjectStore } from "@/stores/project-store"
import { SecurityLevel, PerformanceLevel, ScalabilityLevel } from "@/types/project"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const createProject = useProjectStore((state) => state.createProject)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brief: "",
    stack: {
      frontend: [] as string[],
      backend: [] as string[],
      database: [] as string[],
    },
    requirements: {
      security: SecurityLevel.STANDARD,
      performance: PerformanceLevel.OPTIMIZED,
      scalability: ScalabilityLevel.MEDIUM,
      testCoverage: 80,
      documentation: true,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createProject({
        name: formData.name,
        description: formData.description,
        brief: formData.brief,
        config: {
          stack: formData.stack,
          requirements: formData.requirements,
        },
      })

      toast("success", "Project created successfully!")
      router.push("/projects")
    } catch (error) {
      toast("error", "Failed to create project")
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground">
            Define your project and let AI agents build it for you
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    Enter the basic information about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Project"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="A brief description of your project"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brief">Project Brief</Label>
                    <Textarea
                      id="brief"
                      placeholder="Describe your project in detail. What should it do? What features do you need? Who is the target audience?"
                      className="min-h-[200px]"
                      value={formData.brief}
                      onChange={(e) =>
                        setFormData({ ...formData, brief: e.target.value })
                      }
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Be as detailed as possible. AI agents will use this to generate your application.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                  <CardDescription>
                    Choose the technologies for your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Frontend Framework</Label>
                    <Input placeholder="e.g., React, Vue, Angular" />
                  </div>

                  <div className="space-y-2">
                    <Label>Backend Framework</Label>
                    <Input placeholder="e.g., Node.js, Python, Java" />
                  </div>

                  <div className="space-y-2">
                    <Label>Database</Label>
                    <Input placeholder="e.g., PostgreSQL, MongoDB, MySQL" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements">
              <Card>
                <CardHeader>
                  <CardTitle>Project Requirements</CardTitle>
                  <CardDescription>
                    Define quality and performance requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testCoverage">
                      Test Coverage Target: {formData.requirements.testCoverage}%
                    </Label>
                    <input
                      type="range"
                      id="testCoverage"
                      min="0"
                      max="100"
                      value={formData.requirements.testCoverage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requirements: {
                            ...formData.requirements,
                            testCoverage: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Security: {formData.requirements.security}<br />
                    Performance: {formData.requirements.performance}<br />
                    Scalability: {formData.requirements.scalability}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
