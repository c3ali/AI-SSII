'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAgentStatus, type AgentsStatusResponse } from '@/lib/api'
import { AGENT_POLL_INTERVAL } from '@/lib/constants'

export function useAgentStatus() {
  const [agents, setAgents] = useState<AgentsStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgentStatus = useCallback(async () => {
    try {
      const status = await getAgentStatus()
      setAgents(status)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch agent status'
      setError(message)
      console.error('Error fetching agent status:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgentStatus()

    // Poll every 2 seconds
    const interval = setInterval(fetchAgentStatus, AGENT_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchAgentStatus])

  return {
    agents,
    loading,
    error,
    refresh: fetchAgentStatus,
  }
}
