import { DecisionPanel } from '@/components/decision/DecisionPanel'
import { notFound } from 'next/navigation'

// Mock function - replace with actual API call
async function getDecision(id: string) {
  // TODO: Replace with actual API call
  // const decision = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/human-decisions/${id}`)

  // Mock data for demo
  return {
    id,
    projectName: 'FoodApp',
    proposal: {
      stack: {
        frontend: 'Next.js 14 (App Router)',
        backend: 'Supabase (auth + db)',
        mobile: 'Expo Router v3 (iOS/Android)',
        payment: 'Stripe Connect',
        maps: 'Mapbox',
        deployment: 'Vercel (Web) + EAS (Mobile)',
        cicd: 'GitHub Actions',
      },
      metrics: {
        cost: 42,
        lighthouse: 98,
        security: 9.2,
      },
    },
    alternative: {
      stack: {
        frontend: 'Next.js 14',
        backend: 'Supabase free tier',
        mobile: 'PWA',
        payment: 'Stripe (basic)',
        deployment: 'Vercel free tier',
      },
      metrics: {
        cost: 0,
        lighthouse: 92,
        security: 8.5,
      },
    },
    deadline: Date.now() + 5 * 60 * 1000, // 5 minutes from now
    status: 'pending',
  }
}

export default async function DecisionPage({ params }: { params: { id: string } }) {
  const decision = await getDecision(params.id)

  if (!decision) {
    notFound()
  }

  return (
    <div className="py-8">
      <DecisionPageClient decision={decision} />
    </div>
  )
}

// Client component for interactivity
'use client'

import { useHumanDecision } from '@/hooks/useHumanDecision'
import { useState } from 'react'

function DecisionPageClient({ decision }: { decision: any }) {
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
