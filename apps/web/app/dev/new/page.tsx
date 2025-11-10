'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui'

export default function DevNewProjectPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [brief, setBrief] = useState('')
  const [stack, setStack] = useState('NEXTJS')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsGenerating(true)

    try {
      // Call the real API to generate project plan
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          brief,
          stack,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate project')
      }

      const data = await response.json()

      // Store the generated project in localStorage
      if (typeof window !== 'undefined') {
        const projects = JSON.parse(localStorage.getItem('ai_projects') || '[]')
        projects.push(data.project)
        localStorage.setItem('ai_projects', JSON.stringify(projects))
      }

      // Redirect to the generated project page
      router.push(`/dev/projects/${data.project.id}`)
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate project. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-medium">
            🤖 Génération par IA Réelle - Requiert une clé API OpenAI
          </p>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Créer un Projet IA</h1>
          <p className="text-gray-600 mt-1">Décrivez votre projet et l&apos;IA le générera</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Input
                label="Nom du Projet"
                placeholder="Mon Super Projet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isGenerating}
              />

              <Textarea
                label="Description Détaillée"
                placeholder="Décrivez votre projet : fonctionnalités, public cible, objectifs..."
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                required
                rows={8}
                disabled={isGenerating}
              />

              <Select
                label="Technologie"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                disabled={isGenerating}
              >
                <option value="NEXTJS">Next.js (React Web App)</option>
                <option value="REACT_NATIVE">React Native (Mobile)</option>
                <option value="EXPO">Expo (Cross-platform)</option>
                <option value="NUXT">Nuxt.js (Vue.js)</option>
                <option value="FLUTTER">Flutter</option>
              </Select>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isGenerating}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  isLoading={isGenerating}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? '🤖 Génération en cours...' : '🚀 Générer avec l&apos;IA'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
