import { agentOrchestrator } from './agent-orchestrator'

interface Job {
  id: string
  type: string
  data: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  processedAt?: Date
  error?: string
}

/**
 * Simple in-memory job queue
 * Dans une vraie application, utiliser BullMQ, Bee-Queue, ou AWS SQS
 */
class QueueManager {
  private jobs: Map<string, Job> = new Map()
  private isProcessing = false

  /**
   * Ajouter un job à la queue
   */
  async addJob(type: string, data: any): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const job: Job = {
      id: jobId,
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
    }

    this.jobs.set(jobId, job)

    // Démarrer le traitement si pas déjà en cours
    if (!this.isProcessing) {
      this.processQueue()
    }

    return jobId
  }

  /**
   * Traiter la queue
   */
  private async processQueue() {
    this.isProcessing = true

    while (this.hasPendingJobs()) {
      const job = this.getNextJob()

      if (job) {
        await this.processJob(job)
      }
    }

    this.isProcessing = false
  }

  /**
   * Vérifier s'il y a des jobs en attente
   */
  private hasPendingJobs(): boolean {
    return Array.from(this.jobs.values()).some((job) => job.status === 'pending')
  }

  /**
   * Récupérer le prochain job
   */
  private getNextJob(): Job | undefined {
    return Array.from(this.jobs.values()).find((job) => job.status === 'pending')
  }

  /**
   * Traiter un job spécifique
   */
  private async processJob(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.type}`)

    // Mettre à jour le statut
    job.status = 'processing'
    job.processedAt = new Date()

    try {
      switch (job.type) {
        case 'generate-project':
          await this.handleGenerateProject(job.data)
          break

        default:
          console.warn(`Unknown job type: ${job.type}`)
      }

      job.status = 'completed'
      console.log(`Job ${job.id} completed successfully`)
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error)
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  /**
   * Handler pour la génération de projet
   */
  private async handleGenerateProject(data: any) {
    const { projectId } = data

    if (!projectId) {
      throw new Error('Project ID is required')
    }

    // Lancer l'orchestrateur d'agents
    await agentOrchestrator.runProjectGeneration(projectId)
  }

  /**
   * Récupérer le statut d'un job
   */
  getJobStatus(jobId: string): Job | undefined {
    return this.jobs.get(jobId)
  }

  /**
   * Nettoyer les jobs anciens (plus de 24h)
   */
  cleanupOldJobs() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt.getTime() < oneDayAgo && job.status !== 'pending') {
        this.jobs.delete(jobId)
      }
    }
  }
}

export const queueManager = new QueueManager()

// Nettoyer les vieux jobs toutes les heures
if (typeof window === 'undefined') {
  // Seulement côté serveur
  setInterval(() => {
    queueManager.cleanupOldJobs()
  }, 60 * 60 * 1000)
}
