import prisma from '@/lib/prisma'
import { Agent, ExecutionStatus, ProjectStatus } from '@prisma/client'
import { realtimeService } from './realtime.service'

/**
 * Orchestrateur central pour coordonner les 6 agents IA
 */
class AgentOrchestrator {
  private agentOrder: Agent[] = [
    'DIRECTOR',
    'ARCHITECT',
    'DEVELOPER',
    'SECURITY',
    'QA',
    'DEVOPS',
  ]

  /**
   * Lancer le workflow complet de génération
   */
  async runProjectGeneration(projectId: string) {
    try {
      // Mettre à jour le statut
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.RUNNING, startedAt: new Date() },
      })

      // Exécuter les agents dans l'ordre
      for (const agent of this.agentOrder) {
        await this.executeAgent(projectId, agent)
      }

      // Marquer comme succès
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: ProjectStatus.SUCCESS,
          completedAt: new Date(),
        },
      })

      // Notifier via Realtime
      await realtimeService.notifyProjectCompleted(projectId)
    } catch (error) {
      console.error(`Error in project generation ${projectId}:`, error)

      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.FAILED },
      })

      throw error
    }
  }

  /**
   * Exécuter un agent spécifique
   */
  private async executeAgent(projectId: string, agent: Agent) {
    const startTime = Date.now()

    // Récupérer le projet et les exécutions précédentes
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        executions: {
          where: { agent: { not: agent } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // Créer l'exécution
    const execution = await prisma.execution.create({
      data: {
        projectId,
        agent,
        status: ExecutionStatus.RUNNING,
        input: this.prepareAgentInput(project, project.executions),
        logs: [],
      },
    })

    try {
      // Simuler l'exécution de l'agent (dans la vraie implémentation, appeler l'API Claude)
      const output = await this.simulateAgentExecution(agent, project, project.executions)

      // Calculer les métriques
      const duration = Date.now() - startTime
      const tokensUsed = this.estimateTokensUsed(agent, project.brief.length)
      const cost = tokensUsed * 0.00002 // $0.00002 per token

      // Mettre à jour l'exécution
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.SUCCESS,
          output,
          duration,
          tokensUsed,
          cost,
          completedAt: new Date(),
        },
      })

      // Mettre à jour le projet avec les résultats de l'agent
      await this.updateProjectWithAgentOutput(projectId, agent, output)

      // Notifier via Realtime
      await realtimeService.notifyAgentUpdate(projectId, agent, 'completed')
    } catch (error) {
      console.error(`Error executing agent ${agent} for project ${projectId}:`, error)

      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      })

      throw error
    }
  }

  /**
   * Préparer l'input pour un agent basé sur les résultats précédents
   */
  private prepareAgentInput(project: any, previousExecutions: any[]) {
    const context: any = {
      brief: project.brief,
      config: project.config,
    }

    // Ajouter les outputs des agents précédents
    for (const exec of previousExecutions) {
      if (exec.status === 'SUCCESS' && exec.output) {
        context[exec.agent.toLowerCase()] = exec.output
      }
    }

    return context
  }

  /**
   * Simuler l'exécution d'un agent (à remplacer par de vraies calls API Claude)
   */
  private async simulateAgentExecution(agent: Agent, project: any, previousExecutions: any[]): Promise<any> {
    // Attendre un peu pour simuler le traitement
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

    switch (agent) {
      case 'DIRECTOR':
        return {
          plan: {
            phases: ['Setup', 'Development', 'Testing', 'Deployment'],
            timeline: '7 days',
            resources: ['Frontend Dev', 'Backend Dev', 'DevOps'],
          },
        }

      case 'ARCHITECT':
        return {
          stack: {
            frontend: 'Next.js 14',
            backend: 'Next.js API Routes',
            database: 'Supabase PostgreSQL',
            deployment: 'Vercel',
          },
          architecture: {
            pattern: 'Monorepo with App Router',
            authentication: 'Supabase Auth',
            storage: 'Supabase Storage',
          },
        }

      case 'DEVELOPER':
        return {
          components: ['Header', 'Footer', 'Dashboard', 'Forms'],
          api_routes: ['/api/auth', '/api/data', '/api/upload'],
          pages: ['/', '/dashboard', '/profile'],
          features: ['Authentication', 'CRUD Operations', 'File Upload'],
        }

      case 'SECURITY':
        return {
          vulnerabilities: [],
          owaspScore: 9.2,
          recommendations: [
            'Enable CSRF protection',
            'Use HTTPS only',
            'Implement rate limiting',
          ],
        }

      case 'QA':
        return {
          tests: {
            unit: 45,
            integration: 12,
            e2e: 8,
          },
          coverage: 87.5,
          passed: 65,
          failed: 0,
        }

      case 'DEVOPS':
        return {
          deployment: {
            platform: 'Vercel',
            url: `https://project-${project.id.substring(0, 8)}.vercel.app`,
            status: 'deployed',
          },
          github: {
            repository: `https://github.com/generated/${project.name}`,
            branch: 'main',
          },
        }

      default:
        return {}
    }
  }

  /**
   * Estimer les tokens utilisés par un agent
   */
  private estimateTokensUsed(agent: Agent, briefLength: number): number {
    const base = Math.floor(briefLength * 2) // 2 tokens per character approximativement

    const multipliers: Record<Agent, number> = {
      DIRECTOR: 0.5,
      ARCHITECT: 1.0,
      DEVELOPER: 3.0,
      SECURITY: 0.8,
      QA: 1.2,
      DEVOPS: 0.6,
    }

    return Math.floor(base * multipliers[agent])
  }

  /**
   * Mettre à jour le projet avec les résultats d'un agent
   */
  private async updateProjectWithAgentOutput(projectId: string, agent: Agent, output: any) {
    const fieldMapping: Record<Agent, string> = {
      DIRECTOR: 'plan',
      ARCHITECT: 'architecture',
      DEVELOPER: 'codebase',
      SECURITY: 'security',
      QA: 'tests',
      DEVOPS: 'deployment',
    }

    const field = fieldMapping[agent]

    await prisma.project.update({
      where: { id: projectId },
      data: {
        [field]: output,
      },
    })

    // Si c'est le DevOps, mettre à jour les URLs
    if (agent === 'DEVOPS' && output.deployment) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          deployUrl: output.deployment.url,
          githubUrl: output.github?.repository,
        },
      })
    }
  }

  /**
   * Récupérer le statut de tous les agents
   */
  async getAgentsStatus() {
    // Pour une version simple, retourner un statut mockté
    // Dans une vraie implémentation, on surveillerait les workers actifs
    return {
      director: { status: 'idle', current_task: null, tokens_per_hour: 1200 },
      architect: { status: 'idle', current_task: null, tokens_per_hour: 2400 },
      developer: { status: 'idle', current_task: null, tokens_per_hour: 4800 },
      security: { status: 'idle', current_task: null, tokens_per_hour: 800 },
      qa: { status: 'idle', current_task: null, tokens_per_hour: 600 },
      devops: { status: 'idle', current_task: null, tokens_per_hour: 400 },
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator()
