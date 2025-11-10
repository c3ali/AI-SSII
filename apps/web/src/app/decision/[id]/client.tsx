'use client'

import { useState } from 'react'
import { DecisionPanel } from '@/components/decision/DecisionPanel'
import { useHumanDecision } from '@/hooks/useHumanDecision'

export function DecisionPageClient({ decision }: { decision: any }) {
  const { approve, reject, loading, responded } = useHumanDecision(decision.id)
  const [showModifyDialog, setShowModifyDialog] = useState(false)

  const handleApprove = async () => {
    await approve()
  }

  const handleAlternative = async () => {
    await approve() // Alternative is also an approval with specific choice
  }

  const handleModify = () => {
    setShowModifyDialog(true)
    // TODO: Show modification dialog
  }

  return (
    <DecisionPanel
      projectName={decision.projectName}
      proposal={decision.proposal}
      alternative={decision.alternative}
      deadline={decision.deadline}
      onApprove={handleApprove}
      onAlternative={handleAlternative}
      onModify={handleModify}
      loading={loading}
      responded={responded}
    />
  )
}
