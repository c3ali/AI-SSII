'use client'

import { useState, useCallback } from 'react'
import { respondToDecision, type RespondToDecisionRequest } from '@/lib/api'
import { toast } from 'sonner'

export function useHumanDecision(decisionId: string) {
  const [loading, setLoading] = useState(false)
  const [responded, setResponded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const respond = useCallback(async (approved: boolean, modifications?: string) => {
    setLoading(true)
    setError(null)

    try {
      const data: RespondToDecisionRequest = { approved, modifications }
      await respondToDecision(decisionId, data)

      setResponded(true)
      toast.success(approved ? 'Décision validée !' : 'Décision rejetée')

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to respond to decision'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [decisionId])

  const approve = useCallback(() => respond(true), [respond])
  const reject = useCallback((modifications?: string) => respond(false, modifications), [respond])

  return {
    loading,
    responded,
    error,
    respond,
    approve,
    reject,
  }
}
