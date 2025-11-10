'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { projectsApi } from '@/lib/api/projects'

export default function NewProjectPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [brief, setBrief] = useState('')
  const [stack, setStack] = useState('NEXTJS')
  const [budget, setBudget] = useState('50')
  const [timeline, setTimeline] = useState('7')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !brief) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const project = await projectsApi.create({
        name,
        brief,
        stack,
        budget: parseFloat(budget),
        timeline: parseInt(timeline),
      })
      router.push(`/dashboard/projects/${project.id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-1">Tell us about your project and our AI agents will build it</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Project Name"
              placeholder="My Awesome App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Textarea
              label="Project Brief"
              placeholder="Describe your project in detail. What features do you need? Who is your target audience? What problem does it solve?"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
              rows={6}
            />

            <Select
              label="Technology Stack"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
            >
              <option value="NEXTJS">Next.js (React Web App)</option>
              <option value="REACT_NATIVE">React Native (Native Mobile)</option>
              <option value="EXPO">Expo (Cross-platform Mobile)</option>
              <option value="NUXT">Nuxt.js (Vue Web App)</option>
              <option value="FLUTTER">Flutter (Cross-platform)</option>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Budget (€)"
                type="number"
                placeholder="50"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                step="10"
              />

              <Input
                label="Timeline (days)"
                type="number"
                placeholder="7"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                min="1"
                max="90"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
