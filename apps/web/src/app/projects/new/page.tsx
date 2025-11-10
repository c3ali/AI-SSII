'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    brief: '',
    stack: 'NEXTJS',
    budget: 50,
    timeline: 7,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const project = await res.json()
        router.push(`/projects/${project.id}`)
      } else {
        alert('Erreur lors de la création du projet')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Erreur lors de la création du projet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau Projet</h1>
        <p className="text-muted-foreground">
          Créez un nouveau projet de développement avec l'IA
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Projet</CardTitle>
          <CardDescription>
            Remplissez les détails de votre projet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom du Projet *
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mon Application E-commerce"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="brief" className="text-sm font-medium">
                Description *
              </label>
              <textarea
                id="brief"
                required
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.brief}
                onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                placeholder="Décrivez votre projet en détail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="stack" className="text-sm font-medium">
                  Stack Technologique
                </label>
                <select
                  id="stack"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.stack}
                  onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                >
                  <option value="NEXTJS">Next.js</option>
                  <option value="REACT_NATIVE">React Native</option>
                  <option value="EXPO">Expo</option>
                  <option value="NUXT">Nuxt.js</option>
                  <option value="FLUTTER">Flutter</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-medium">
                  Budget (€)
                </label>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="timeline" className="text-sm font-medium">
                  Timeline (jours)
                </label>
                <input
                  id="timeline"
                  type="number"
                  min="1"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer le Projet'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
