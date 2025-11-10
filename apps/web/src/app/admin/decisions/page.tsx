'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Edit, TrendingUp, TrendingDown } from 'lucide-react'

// Mock data - à remplacer par de vraies données API
const decisions = [
  {
    id: 'dec_001',
    projectName: 'FoodApp',
    createdAt: '2025-01-10 14:32',
    decidedAt: '2025-01-10 14:35',
    status: 'approved' as const,
    choice: 'proposal',
    responseTime: '3m 12s',
    user: 'user@example.com',
    proposal: {
      stack: 'Next.js 14 + Supabase + Stripe Connect',
      cost: 42,
      lighthouse: 98,
    },
    alternative: {
      stack: 'Next.js 14 + Supabase free tier + PWA',
      cost: 0,
      lighthouse: 92,
    },
  },
  {
    id: 'dec_002',
    projectName: 'E-commerce Platform',
    createdAt: '2025-01-10 13:15',
    decidedAt: '2025-01-10 13:17',
    status: 'approved' as const,
    choice: 'alternative',
    responseTime: '2m 04s',
    user: 'admin@ssii.ai',
    proposal: {
      stack: 'Next.js + Shopify + Algolia',
      cost: 89,
      lighthouse: 95,
    },
    alternative: {
      stack: 'Next.js + Medusa.js + PostgreSQL',
      cost: 45,
      lighthouse: 94,
    },
  },
  {
    id: 'dec_003',
    projectName: 'Dashboard Analytics',
    createdAt: '2025-01-10 12:45',
    decidedAt: null,
    status: 'pending' as const,
    choice: null,
    responseTime: null,
    user: 'cto@startup.io',
    proposal: {
      stack: 'React + Recharts + PostgreSQL',
      cost: 35,
      lighthouse: 96,
    },
    alternative: {
      stack: 'Vue.js + Chart.js + Supabase',
      cost: 18,
      lighthouse: 93,
    },
  },
  {
    id: 'dec_004',
    projectName: 'Blog Platform',
    createdAt: '2025-01-10 11:20',
    decidedAt: '2025-01-10 11:21',
    status: 'rejected' as const,
    choice: null,
    responseTime: '1m 18s',
    user: 'dev@company.com',
    proposal: {
      stack: 'WordPress + MySQL',
      cost: 25,
      lighthouse: 78,
    },
    alternative: {
      stack: 'Next.js + MDX + Vercel',
      cost: 12,
      lighthouse: 98,
    },
  },
  {
    id: 'dec_005',
    projectName: 'Portfolio Website',
    createdAt: '2025-01-10 10:05',
    decidedAt: '2025-01-10 15:10',
    status: 'expired' as const,
    choice: null,
    responseTime: null,
    user: 'designer@agency.com',
    proposal: {
      stack: 'Astro + Tailwind + Netlify',
      cost: 8,
      lighthouse: 99,
    },
    alternative: {
      stack: 'Next.js + Framer Motion',
      cost: 15,
      lighthouse: 96,
    },
  },
]

const stats = [
  { label: 'Total', value: decisions.length, icon: Clock, color: 'purple' },
  { label: 'Approuvées', value: decisions.filter(d => d.status === 'approved').length, icon: CheckCircle, color: 'emerald' },
  { label: 'Refusées', value: decisions.filter(d => d.status === 'rejected').length, icon: XCircle, color: 'red' },
  { label: 'En attente', value: decisions.filter(d => d.status === 'pending').length, icon: Clock, color: 'yellow' },
]

export default function DecisionsPage() {
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'pending' | 'expired'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const filteredDecisions = filter === 'all' ? decisions : decisions.filter(d => d.status === filter)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black">
          <span className="gradient-text">Historique des Décisions</span>
        </h1>
        <p className="text-foreground/60 mt-2">Toutes les décisions humaines validées ou refusées</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-strong rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/30`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-3xl font-black gradient-text">{stat.value}</p>
                  <p className="text-sm text-foreground/60">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {[
          { value: 'all' as const, label: 'Toutes' },
          { value: 'approved' as const, label: 'Approuvées' },
          { value: 'rejected' as const, label: 'Refusées' },
          { value: 'pending' as const, label: 'En attente' },
          { value: 'expired' as const, label: 'Expirées' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              filter === option.value
                ? 'glass-strong border-2 border-purple-500/50 glow gradient-text'
                : 'glass border border-white/10 text-foreground/60 hover:text-foreground hover:border-white/20'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Decisions Table */}
      <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Projet</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Utilisateur</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Créée</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Statut</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Choix</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Temps</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDecisions.map((decision) => (
                <tr key={decision.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-foreground">{decision.projectName}</p>
                      <p className="text-xs text-foreground/60">{decision.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-foreground/80">{decision.user}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-foreground/80">{decision.createdAt}</p>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      decision.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      decision.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      decision.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 animate-pulse' :
                      'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                    }`}>
                      {decision.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                      {decision.status === 'rejected' && <XCircle className="h-3 w-3" />}
                      {decision.status === 'pending' && <Clock className="h-3 w-3" />}
                      {decision.status === 'approved' ? 'Approuvée' :
                       decision.status === 'rejected' ? 'Refusée' :
                       decision.status === 'pending' ? 'En attente' :
                       'Expirée'}
                    </div>
                  </td>
                  <td className="p-4">
                    {decision.choice === 'proposal' && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <span className="text-foreground/80">Proposition</span>
                      </div>
                    )}
                    {decision.choice === 'alternative' && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <TrendingDown className="h-4 w-4 text-blue-400" />
                        <span className="text-foreground/80">Alternative</span>
                      </div>
                    )}
                    {!decision.choice && <span className="text-sm text-foreground/40">-</span>}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground/80">{decision.responseTime || '-'}</span>
                  </td>
                  <td className="p-4">
                    <button className="p-2 glass rounded-lg border border-white/10 hover:border-white/20 transition-all">
                      <Edit className="h-4 w-4 text-foreground/60" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
