import prisma from '@/lib/prisma'
import { agentOrchestrator } from './agent-orchestrator'
import { queueManager } from './queue.service'

// Types locaux pour éviter dépendance Prisma client
export type ProjectStatus = 'DRAFT' | 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
export type Agent = 'DIRECTOR' | 'ARCHITECT' | 'DEVELOPER' | 'SECURITY' | 'QA' | 'DEVOPS'

export interface CreateProjectInput {
  brief: string
  userId?: string
  budgetTokens?: number
  target?: 'web' | 'mobile' | 'both'
  stack?: string
}

export interface ProjectStatusResponse {
  status: string
  tokens_spent: number
  human_decisions: any[]
  progress?: number
  current_step?: string
  urls?: {
    github?: string
    preview?: string
    dashboard?: string
  }
}

class ProjectService {
  /**
   * Créer un nouveau projet et lancer la génération
   */
  async createProject(input: CreateProjectInput) {
    const { brief, userId, budgetTokens = 50000, target = 'both' } = input

    // Validation
    if (!brief || brief.length < 50) {
      throw new Error('Le brief doit contenir au moins 50 caractères')
    }

    // Créer le projet dans la DB
    const project = await prisma.project.create({
      data: {
        name: this.generateProjectName(brief),
        brief,
        status: 'QUEUED',
        userId: userId || 'anonymous', // Temporary for demo
        config: {
          budgetTokens,
          target,
        },
        budget: budgetTokens * 0.00002, // €/token
      },
    })

    // Ajouter à la queue pour traitement async
    await queueManager.addJob('generate-project', {
      projectId: project.id,
      brief,
      budgetTokens,
      target,
    })

    return {
      project_id: project.id,
      token_estimate: budgetTokens,
      status: 'queued',
    }
  }

  /**
   * Récupérer le statut d'un projet
   */
  async getProjectStatus(projectId: string): Promise<ProjectStatusResponse> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        executions: {
          orderBy: { createdAt: 'desc' },
        },
        decisions: {
          where: {
            status: { in: ['PENDING', 'APPROVED', 'REJECTED'] },
          },
        },
        metrics: true,
      },
    })

    if (!project) {
      throw new Error('Projet introuvable')
    }

    // Calculer la progression
    const progress = this.calculateProgress(project.executions)
    const currentStep = this.getCurrentStep(project.executions)

    // Mapper les décisions
    const humanDecisions = project.decisions.map((decision) => ({
      id: decision.id,
      type: decision.type,
      proposal: decision.proposal,
      alternative: decision.alternative,
      deadline: decision.deadline.getTime(),
      status: decision.status.toLowerCase(),
    }))

    // Calculer les tokens dépensés
    const tokensSpent = project.executions.reduce(
      (sum, exec) => sum + (exec.tokensUsed || 0),
      0
    )

    return {
      status: this.mapProjectStatus(project.status),
      tokens_spent: tokensSpent,
      human_decisions: humanDecisions,
      progress,
      current_step: currentStep,
      urls: project.status === 'SUCCESS'
        ? {
            github: project.githubUrl || undefined,
            preview: project.deployUrl || undefined,
            dashboard: project.docsUrl || undefined,
          }
        : undefined,
    }
  }

  /**
   * Calculer la progression basée sur les exécutions
   */
  private calculateProgress(executions: any[]): number {
    const totalSteps = 6 // Director, Architect, Developer, Security, QA, DevOps
    const completedSteps = executions.filter(
      (exec) => exec.status === 'SUCCESS'
    ).length

    return Math.round((completedSteps / totalSteps) * 100)
  }

  /**
   * Déterminer l'étape actuelle
   */
  private getCurrentStep(executions: any[]): string {
    const runningExec = executions.find((exec) => exec.status === 'RUNNING')
    if (runningExec) {
      return this.mapAgentToStep(runningExec.agent)
    }

    // Trouver la prochaine étape
    const agentOrder: Agent[] = [
      'DIRECTOR',
      'ARCHITECT',
      'DEVELOPER',
      'SECURITY',
      'QA',
      'DEVOPS',
    ]

    for (const agent of agentOrder) {
      const exec = executions.find((e) => e.agent === agent)
      if (!exec || exec.status !== 'SUCCESS') {
        return this.mapAgentToStep(agent)
      }
    }

    return 'completed'
  }

  /**
   * Mapper un agent vers une étape frontend
   */
  private mapAgentToStep(agent: Agent): string {
    const mapping: Record<Agent, string> = {
      DIRECTOR: 'analyzing',
      ARCHITECT: 'designing',
      DEVELOPER: 'coding',
      SECURITY: 'security',
      QA: 'testing',
      DEVOPS: 'deploying',
    }
    return mapping[agent] || 'unknown'
  }

  /**
   * Mapper le statut du projet
   */
  private mapProjectStatus(status: ProjectStatus): string {
    const mapping: Record<ProjectStatus, string> = {
      DRAFT: 'draft',
      QUEUED: 'queued',
      RUNNING: 'running',
      SUCCESS: 'deployed',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
    }
    return mapping[status] || 'unknown'
  }

  /**
   * Générer un nom de projet depuis le brief
   */
  private generateProjectName(brief: string): string {
    // Extraire les premiers mots significatifs
    const words = brief
      .split(' ')
      .filter((w) => w.length > 3)
      .slice(0, 3)
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')

    return `${words || 'projet'}-${Date.now()}`
  }

  /**
   * Mettre à jour le statut d'un projet
   */
  async updateProjectStatus(projectId: string, status: ProjectStatus) {
    return prisma.project.update({
      where: { id: projectId },
      data: { status },
    })
  }

  /**
   * Enregistrer les URLs de déploiement
   */
  async updateProjectUrls(
    projectId: string,
    urls: { github?: string; preview?: string; dashboard?: string }
  ) {
    return prisma.project.update({
      where: { id: projectId },
      data: {
        githubUrl: urls.github,
        deployUrl: urls.preview,
        docsUrl: urls.dashboard,
      },
    })
  }
}

export const projectService = new ProjectService()
