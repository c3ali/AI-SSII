import { DecisionPanel } from '@/components/decision/DecisionPanel'
import { notFound } from 'next/navigation'
import { DecisionPageClient } from './client'

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
