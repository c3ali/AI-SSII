'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [tokens, setTokens] = useState<number>(TOKEN_COSTS.DEFAULT)
  const [target, setTarget] = useState<string>(TARGETS.BOTH)
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
      <Toaster position="top-right" theme="dark" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 pt-8">
          <div className="inline-block">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight">
              <span className="gradient-text">SSII AI Studio</span>
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-full mt-4" />
          </div>

          <p className="text-2xl md:text-3xl text-foreground/80 font-light max-w-2xl mx-auto leading-relaxed">
            Transformez un brief en application
            <span className="block gradient-text font-semibold mt-2">en 12 minutes chrono ⚡</span>
          </p>

          {connected && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/30 glow">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-sm text-emerald-400 font-medium">Connecté en temps réel</span>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl border-white/10">
          <div className="space-y-8">
            {/* Prompt Input */}
            <PromptInput
              value={brief}
              onChange={setBrief}
              disabled={loading}
            />

            {/* Advanced Settings */}
            <details className="glass rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20">
              <summary className="cursor-pointer p-5 font-semibold hover:bg-white/5 transition-all duration-200 flex items-center gap-3 text-lg">
                <span className="text-2xl">⚙️</span>
                <span>Paramètres avancés</span>
              </summary>
              <div className="p-6 space-y-8 border-t border-white/10 bg-white/5">
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
              <div className="glass-strong rounded-2xl p-6 border border-emerald-500/30 glow-strong animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-xl font-bold gradient-text">Application générée avec succès !</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {project.urls.github && (
                    <a
                      href={project.urls.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group px-6 py-3 glass rounded-xl hover:glass-strong transition-all duration-300 flex items-center gap-3 hover:scale-105 hover:glow"
                    >
                      <span className="text-xl">📦</span>
                      <span className="font-medium group-hover:gradient-text transition-all">Code GitHub</span>
                    </a>
                  )}
                  {project.urls.preview && (
                    <a
                      href={project.urls.preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group px-6 py-3 glass rounded-xl hover:glass-strong transition-all duration-300 flex items-center gap-3 hover:scale-105 hover:glow"
                    >
                      <span className="text-xl">🌐</span>
                      <span className="font-medium group-hover:gradient-text transition-all">Preview</span>
                    </a>
                  )}
                  {project.urls.dashboard && (
                    <a
                      href={project.urls.dashboard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group px-6 py-3 glass rounded-xl hover:glass-strong transition-all duration-300 flex items-center gap-3 hover:scale-105 hover:glow"
                    >
                      <span className="text-xl">📊</span>
                      <span className="font-medium group-hover:gradient-text transition-all">Dashboard</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group glass rounded-2xl p-8 text-center hover:glass-strong transition-all duration-300 hover:scale-105 hover:glow border-purple-500/20 hover:border-purple-500/40">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <h3 className="text-2xl font-bold mb-2 gradient-text">12 minutes</h3>
            <p className="text-foreground/60 text-base">
              De l'idée à la production
            </p>
          </div>

          <div className="group glass rounded-2xl p-8 text-center hover:glass-strong transition-all duration-300 hover:scale-105 hover:glow border-blue-500/20 hover:border-blue-500/40">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💰</div>
            <h3 className="text-2xl font-bold mb-2 gradient-text">3k€ vs 80k€</h3>
            <p className="text-foreground/60 text-base">
              27x moins cher qu'une SSII
            </p>
          </div>

          <div className="group glass rounded-2xl p-8 text-center hover:glass-strong transition-all duration-300 hover:scale-105 hover:glow border-emerald-500/20 hover:border-emerald-500/40">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🤖</div>
            <h3 className="text-2xl font-bold mb-2 gradient-text">6 agents IA</h3>
            <p className="text-foreground/60 text-base">
              Director, Architect, Dev, Security, QA, DevOps
            </p>
          </div>
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
