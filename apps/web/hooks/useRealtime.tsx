'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'

export type RealtimeEvent =
  | { type: 'agent_update'; agent: string; status: string; task?: string }
  | { type: 'human_decision_needed'; decision_id: string; deadline: number }
  | { type: 'project_completed'; project_id: string; urls: Record<string, string> }
  | { type: 'project_update'; project_id: string; status: string; progress?: number }

interface UseRealtimeOptions {
  projectId?: string
  onEvent?: (event: RealtimeEvent) => void
}

export function useRealtime({ projectId, onEvent }: UseRealtimeOptions = {}) {
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const handleEvent = useCallback((event: RealtimeEvent) => {
    setEvents(prev => [...prev, event])
    onEvent?.(event)

    // Show toast notifications for important events
    if (event.type === 'human_decision_needed') {
      toast.warning('Décision requise', {
        description: 'Votre validation est nécessaire',
        action: {
          label: 'Voir',
          onClick: () => window.open(`/decision/${event.decision_id}`, '_blank'),
        },
      })
    } else if (event.type === 'project_completed') {
      toast.success('Projet terminé !', {
        description: 'Votre application est prête',
      })
    }
  }, [onEvent])

  useEffect(() => {
    // Connect to Supabase Realtime
    const channelName = projectId ? `project:${projectId}` : 'global'
    const newChannel = supabase.channel(channelName)

    // Subscribe to project updates if projectId provided
    if (projectId) {
      newChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        (payload: any) => {
          const event: RealtimeEvent = {
            type: 'project_update',
            project_id: projectId,
            status: payload.new?.status || 'unknown',
            progress: payload.new?.progress,
          }
          handleEvent(event)
        }
      )
    }

    // Subscribe to broadcast events
    newChannel.on('broadcast', { event: 'event' }, ({ payload }) => {
      handleEvent(payload as RealtimeEvent)
    })

    newChannel.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED')
      if (status === 'SUBSCRIBED') {
        console.log('✅ Connected to Realtime')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime connection error')
        toast.error('Erreur de connexion temps réel')
      }
    })

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
      setConnected(false)
    }
  }, [projectId, handleEvent])

  const sendEvent = useCallback((event: RealtimeEvent) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'event',
        payload: event,
      })
    }
  }, [channel])

  return {
    connected,
    events,
    sendEvent,
  }
}
