import { createClient } from '@supabase/supabase-js'
import { Agent } from '@prisma/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Service pour gérer les événements temps réel via Supabase
 */
class RealtimeService {
  private supabase = createClient(supabaseUrl, supabaseServiceKey)

  /**
   * Notifier qu'un agent a mis à jour son statut
   */
  async notifyAgentUpdate(projectId: string, agent: Agent, status: 'started' | 'completed' | 'failed') {
    try {
      // Publier un événement dans la table realtime
      await this.publishEvent({
        type: 'agent_update',
        project_id: projectId,
        agent: agent.toLowerCase(),
        status,
        timestamp: new Date().toISOString(),
      })

      console.log(`Notified agent update: ${agent} - ${status} for project ${projectId}`)
    } catch (error) {
      console.error('Error notifying agent update:', error)
    }
  }

  /**
   * Notifier qu'une décision humaine est requise
   */
  async notifyHumanDecisionNeeded(projectId: string, decisionId: string) {
    try {
      await this.publishEvent({
        type: 'human_decision_needed',
        project_id: projectId,
        decision_id: decisionId,
        timestamp: new Date().toISOString(),
      })

      console.log(`Notified human decision needed: ${decisionId} for project ${projectId}`)
    } catch (error) {
      console.error('Error notifying human decision:', error)
    }
  }

  /**
   * Notifier que le projet est terminé
   */
  async notifyProjectCompleted(projectId: string) {
    try {
      await this.publishEvent({
        type: 'project_completed',
        project_id: projectId,
        timestamp: new Date().toISOString(),
      })

      console.log(`Notified project completed: ${projectId}`)
    } catch (error) {
      console.error('Error notifying project completion:', error)
    }
  }

  /**
   * Notifier qu'une erreur s'est produite
   */
  async notifyProjectError(projectId: string, error: string) {
    try {
      await this.publishEvent({
        type: 'project_error',
        project_id: projectId,
        error,
        timestamp: new Date().toISOString(),
      })

      console.log(`Notified project error: ${projectId}`)
    } catch (error) {
      console.error('Error notifying project error:', error)
    }
  }

  /**
   * Publier un événement générique
   */
  private async publishEvent(event: any) {
    // Option 1: Utiliser Supabase Realtime avec une table events
    // Créer une table "realtime_events" pour stocker les événements
    try {
      const { error } = await this.supabase.from('realtime_events').insert({
        event_type: event.type,
        payload: event,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Supabase realtime error:', error)
      }
    } catch (error) {
      // Si la table n'existe pas encore, logger seulement
      console.log('Realtime event:', event)
    }

    // Option 2: Utiliser les broadcasts Supabase (plus direct mais nécessite une connexion active)
    // const channel = this.supabase.channel('project-updates')
    // await channel.send({
    //   type: 'broadcast',
    //   event: event.type,
    //   payload: event,
    // })
  }

  /**
   * Créer un channel pour écouter les événements
   */
  createChannel(channelName: string) {
    return this.supabase.channel(channelName)
  }
}

export const realtimeService = new RealtimeService()
