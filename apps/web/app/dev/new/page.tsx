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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      // Redirect to results page with generated plan
      router.push(`/dev/projects/demo`)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">
            🔧 MODE DÉVELOPPEMENT - Génération IA simulée
          </p>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Créer un Projet IA</h1>
          <p className="text-gray-600 mt-1">Décrivez votre projet et l'IA le générera</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Nom du Projet"
                placeholder="Mon Super Projet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Textarea
                label="Description Détaillée"
                placeholder="Décrivez votre projet : fonctionnalités, public cible, objectifs..."
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                required
                rows={8}
              />

              <Select
                label="Technologie"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
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
                  {isGenerating ? '🤖 Génération en cours...' : '🚀 Générer avec l\'IA'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
