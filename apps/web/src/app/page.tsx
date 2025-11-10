'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { PromptInput } from '@/components/prompt/PromptInput'
import { TokenSlider } from '@/components/prompt/TokenSlider'
import { TargetSelector } from '@/components/prompt/TargetSelector'
import { GenerateButton } from '@/components/prompt/GenerateButton'
import { ProgressPanel } from '@/components/prompt/ProgressPanel'
import { useProject } from '@/hooks/useProject'
import { useRealtime } from '@/hooks/useRealtime'
import { TOKEN_COSTS, TARGETS } from '@/lib/constants'
import { Toaster } from 'sonner'

export default function LandingPage() {
  const router = useRouter()
  const [brief, setBrief] = useState('')
  const [tokens, setTokens] = useState(TOKEN_COSTS.DEFAULT)
  const [target, setTarget] = useState(TARGETS.BOTH)
  const [showProgress, setShowProgress] = useState(false)

  const { createProject, loading, project, projectId } = useProject()
  const { connected, events } = useRealtime({
    projectId: projectId || undefined,
    onEvent: (event) => {
      if (event.type === 'human_decision_needed') {
        router.push(`/decision/${event.decision_id}`)
      } else if (event.type === 'project_completed') {
        setShowProgress(false)
      }
    },
  })

  const handleGenerate = async () => {
    if (brief.length < 50) {
      return
    }

    try {
      setShowProgress(true)
      await createProject({
        brief,
        budget_tokens: tokens,
        target: target as any,
      })
    } catch (error) {
      setShowProgress(false)
    }
  }

  const getButtonState = () => {
    if (!loading && !project) return 'idle'
    if (project?.status === 'deployed') return 'done'

    const statusMap: Record<string, any> = {
      analyzing: 'analyzing',
      designing: 'designing',
      coding: 'coding',
      testing: 'testing',
      deploying: 'deploying',
    }

    return statusMap[project?.status || 'analyzing'] || 'idle'
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 SSII AI Studio
          </h1>
          <p className="text-xl text-muted-foreground">
            Transformez un brief en application en 12 minutes
          </p>
          {connected && (
            <p className="text-xs text-green-600 flex items-center justify-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Connecté au temps réel
            </p>
          )}
        </div>

        {/* Main Card */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Prompt Input */}
            <PromptInput
              value={brief}
              onChange={setBrief}
              disabled={loading}
            />

            {/* Advanced Settings */}
            <details className="border rounded-lg">
              <summary className="cursor-pointer p-4 font-medium hover:bg-accent rounded-lg transition-colors">
                ⚙️ Paramètres avancés
              </summary>
              <div className="p-4 space-y-6 border-t">
                <TokenSlider
                  value={tokens}
                  onChange={setTokens}
                  disabled={loading}
                />
                <TargetSelector
                  value={target}
                  onChange={setTarget}
                  disabled={loading}
                />
              </div>
            </details>

            {/* Generate Button */}
            <GenerateButton
              state={getButtonState()}
              onClick={handleGenerate}
              disabled={brief.length < 50 || loading}
            />

            {/* Results */}
            {project?.urls && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-green-900">✅ Application générée avec succès !</h3>
                <div className="flex flex-wrap gap-2">
                  {project.urls.github && (
                    <a
                      href={project.urls.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-green-300 rounded-md hover:bg-green-50 transition-colors"
                    >
                      📦 Code GitHub
                    </a>
                  )}
                  {project.urls.preview && (
                    <a
                      href={project.urls.preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-green-300 rounded-md hover:bg-green-50 transition-colors"
                    >
                      🌐 Preview
                    </a>
                  )}
                  {project.urls.dashboard && (
                    <a
                      href={project.urls.dashboard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-green-300 rounded-md hover:bg-green-50 transition-colors"
                    >
                      📊 Dashboard
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Value Proposition */}
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">12 minutes</h3>
              <p className="text-sm text-muted-foreground">
                De l'idée à la production
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-1">3k€ vs 80k€</h3>
              <p className="text-sm text-muted-foreground">
                27x moins cher qu'une SSII
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold mb-1">6 agents IA</h3>
              <p className="text-sm text-muted-foreground">
                Director, Architect, Dev, Security, QA, DevOps
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Panel */}
      <ProgressPanel
        isOpen={showProgress}
        currentStatus={project?.status || 'analyzing'}
        progress={project?.progress}
      />
    </>
  )
}
