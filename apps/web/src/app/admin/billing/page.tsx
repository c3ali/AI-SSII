'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, CreditCard, Download, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data
const revenueStats = [
  { label: 'Revenus (mois)', value: '48,250€', change: '+12.5%', icon: DollarSign, color: 'emerald' },
  { label: 'Revenus (année)', value: '542,840€', change: '+28.3%', icon: TrendingUp, color: 'purple' },
  { label: 'Clients actifs', value: '1,247', change: '+8.2%', icon: CreditCard, color: 'blue' },
  { label: 'MRR', value: '52,100€', change: '+5.4%', icon: Calendar, color: 'yellow' },
]

const monthlyRevenue = [
  { month: 'Jan', revenue: 38200 },
  { month: 'Fév', revenue: 42100 },
  { month: 'Mar', revenue: 39800 },
  { month: 'Avr', revenue: 45600 },
  { month: 'Mai', revenue: 41200 },
  { month: 'Juin', revenue: 47800 },
  { month: 'Juil', revenue: 48250 },
]

const projectsByPlan = [
  { plan: 'Starter (1k tokens)', count: 842, revenue: 16840 },
  { plan: 'Pro (50k tokens)', count: 1247, revenue: 124700 },
  { plan: 'Enterprise (100k tokens)', count: 758, revenue: 379000 },
]

const invoices = [
  { id: 'INV-2025-001', client: 'Startup SAS', amount: 3250, status: 'paid' as const, date: '2025-01-10', plan: 'Pro' },
  { id: 'INV-2025-002', client: 'TechCorp Inc', amount: 12500, status: 'paid' as const, date: '2025-01-09', plan: 'Enterprise' },
  { id: 'INV-2025-003', client: 'Agency Co', amount: 2100, status: 'pending' as const, date: '2025-01-08', plan: 'Pro' },
  { id: 'INV-2025-004', client: 'Freelance Dev', amount: 850, status: 'paid' as const, date: '2025-01-07', plan: 'Starter' },
  { id: 'INV-2025-005', client: 'Enterprise Ltd', amount: 18900, status: 'overdue' as const, date: '2025-01-05', plan: 'Enterprise' },
]

export default function BillingPage() {
  const [mounted, setMounted] = useState(false)

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">
            <span className="gradient-text">Facturation</span>
          </h1>
          <p className="text-foreground/60 mt-2">Gestion des revenus et des factures</p>
        </div>
        <button className="px-6 py-3 glass-strong rounded-xl border border-white/20 hover:border-purple-500/50 hover:glow transition-all duration-300 flex items-center gap-2 group">
          <Download className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="font-medium gradient-text">Exporter tout</span>
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/30`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-3xl font-black gradient-text">{stat.value}</p>
                <p className="text-sm text-foreground/60 mt-1">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-6 gradient-text">Revenus mensuels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
              <XAxis dataKey="month" stroke="hsl(var(--foreground))" opacity={0.6} />
              <YAxis stroke="hsl(var(--foreground))" opacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                }}
                formatter={(value) => [`${value}€`, 'Revenus']}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(263 70% 60%)" strokeWidth={3} dot={{ fill: 'hsl(263 70% 60%)', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Plan */}
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-6 gradient-text">Revenus par plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectsByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
              <XAxis dataKey="plan" stroke="hsl(var(--foreground))" opacity={0.6} />
              <YAxis stroke="hsl(var(--foreground))" opacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                }}
                formatter={(value) => [`${value}€`, 'Revenus']}
              />
              <Bar dataKey="revenue" fill="hsl(217 91% 60%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plans Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projectsByPlan.map((plan) => (
          <div key={plan.plan} className="glass-strong rounded-2xl p-6 border border-white/10">
            <h4 className="font-bold text-foreground mb-4">{plan.plan}</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Projets</span>
                <span className="text-sm font-bold gradient-text">{plan.count.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Revenus</span>
                <span className="text-sm font-bold gradient-text">{plan.revenue.toLocaleString()}€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Moy. par projet</span>
                <span className="text-sm font-bold gradient-text">{Math.round(plan.revenue / plan.count)}€</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold gradient-text">Factures récentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">N° Facture</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Client</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Plan</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Montant</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Date</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Statut</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-mono text-sm text-foreground/80">{invoice.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-foreground">{invoice.client}</p>
                  </td>
                  <td className="p-4">
                    <div className="inline-block px-3 py-1 rounded-full glass border border-white/10 text-xs font-medium text-foreground/80">
                      {invoice.plan}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold gradient-text">{invoice.amount.toLocaleString()}€</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-foreground/80">{invoice.date}</p>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      invoice.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {invoice.status === 'paid' && <CheckCircle2 className="h-3 w-3" />}
                      {invoice.status === 'pending' && <Clock className="h-3 w-3" />}
                      {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'En retard'}
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="p-2 glass rounded-lg border border-white/10 hover:border-white/20 transition-all group">
                      <Download className="h-4 w-4 text-foreground/60 group-hover:text-purple-400 transition-colors" />
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
