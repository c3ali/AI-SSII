import prisma from '@/lib/prisma'
import { realtimeService } from './realtime.service'

// Types locaux pour éviter dépendance Prisma client
export type DecisionType =
  | 'STACK_CHOICE'
  | 'ARCHITECTURE_VALIDATION'
  | 'SECURITY_TRADE_OFF'
  | 'COST_OPTIMIZATION'
  | 'FEATURE_PRIORITIZATION'

export type DecisionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'MODIFIED'

export interface CreateDecisionInput {
  projectId: string
  userId?: string
  type: DecisionType
  proposal: any
  alternative?: any
  deadlineMinutes?: number
}

export interface RespondToDecisionInput {
  approved: boolean
  chosenOption?: 'proposal' | 'alternative'
  modifications?: string
}

class DecisionService {
  /**
   * Créer une nouvelle décision humaine
   */
  async createDecision(input: CreateDecisionInput) {
    const { projectId, userId, type, proposal, alternative, deadlineMinutes = 5 } = input

    // Calculer la deadline
    const deadline = new Date(Date.now() + deadlineMinutes * 60 * 1000)

    const decision = await prisma.humanDecision.create({
      data: {
        projectId,
        userId,
        type,
        proposal,
        alternative,
        deadline,
        status: 'PENDING',
      },
    })

    // Notifier via Realtime
    await realtimeService.notifyHumanDecisionNeeded(projectId, decision.id)

    // Programmer l'expiration
    this.scheduleExpiration(decision.id, deadlineMinutes)

    return decision
  }

  /**
   * Récupérer une décision
   */
  async getDecision(decisionId: string) {
    const decision = await prisma.humanDecision.findUnique({
      where: { id: decisionId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            brief: true,
          },
        },
      },
    })

    if (!decision) {
      throw new Error('Decision not found')
    }

    return decision
  }

  /**
   * Répondre à une décision
   */
  async respondToDecision(decisionId: string, input: RespondToDecisionInput) {
    const decision = await this.getDecision(decisionId)

    // Vérifier que la décision est encore pending
    if (decision.status !== 'PENDING') {
      throw new Error('Cette décision a déjà été traitée')
    }

    // Vérifier que la deadline n'est pas dépassée
    if (new Date() > decision.deadline) {
      throw new Error('Le délai de réponse est dépassé')
    }

    const { approved, chosenOption, modifications } = input

    // Mettre à jour la décision
    const updatedDecision = await prisma.humanDecision.update({
      where: { id: decisionId },
      data: {
        approved,
        chosenOption,
        modifications,
        status: approved ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date(),
      },
    })

    // Si modifié, changer le statut
    if (modifications) {
      await prisma.humanDecision.update({
        where: { id: decisionId },
        data: { status: 'MODIFIED' },
      })
    }

    console.log(`Decision ${decisionId} responded:`, {
      approved,
      chosenOption,
      modifications: modifications ? 'yes' : 'no',
    })

    return updatedDecision
  }

  /**
   * Marquer une décision comme expirée
   */
  async expireDecision(decisionId: string) {
    const decision = await prisma.humanDecision.findUnique({
      where: { id: decisionId },
    })

    if (!decision || decision.status !== 'PENDING') {
      return // Déjà traitée
    }

    await prisma.humanDecision.update({
      where: { id: decisionId },
      data: { status: 'EXPIRED' },
    })

    console.log(`Decision ${decisionId} expired`)
  }

  /**
   * Programmer l'expiration d'une décision
   */
  private scheduleExpiration(decisionId: string, minutes: number) {
    setTimeout(
      async () => {
        await this.expireDecision(decisionId)
      },
      minutes * 60 * 1000
    )
  }

  /**
   * Récupérer toutes les décisions en attente
   */
  async getPendingDecisions(projectId?: string) {
    const where: any = {
      status: 'PENDING',
      deadline: { gt: new Date() },
    }

    if (projectId) {
      where.projectId = projectId
    }

    return prisma.humanDecision.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { deadline: 'asc' },
    })
  }

  /**
   * Récupérer l'historique des décisions
   */
  async getDecisionHistory(projectId?: string) {
    const where: any = {}

    if (projectId) {
      where.projectId = projectId
    }

    return prisma.humanDecision.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const decisionService = new DecisionService()
