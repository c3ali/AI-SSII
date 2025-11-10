'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap, DollarSign, Clock, CheckCircle2 } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data - à remplacer par de vraies données API
const stats = [
  {
    name: 'Projets générés',
    value: '2,847',
    change: '+12.5%',
    trend: 'up' as const,
    icon: Zap,
  },
  {
    name: 'Revenus (30j)',
    value: '142,850€',
    change: '+8.2%',
    trend: 'up' as const,
    icon: DollarSign,
  },
  {
    name: 'Temps moyen',
    value: '11.8 min',
    change: '-0.4 min',
    trend: 'down' as const,
    icon: Clock,
  },
  {
    name: 'Taux de succès',
    value: '94.2%',
    change: '0.0%',
    trend: 'neutral' as const,
    icon: CheckCircle2,
  },
]

const projectsData = [
  { date: '01/01', count: 45 },
  { date: '02/01', count: 52 },
  { date: '03/01', count: 48 },
  { date: '04/01', count: 61 },
  { date: '05/01', count: 55 },
  { date: '06/01', count: 67 },
  { date: '07/01', count: 72 },
]

const revenueData = [
  { date: '01/01', revenue: 4200 },
  { date: '02/01', revenue: 4800 },
  { date: '03/01', revenue: 4500 },
  { date: '04/01', revenue: 5900 },
  { date: '05/01', revenue: 5200 },
  { date: '06/01', revenue: 6400 },
  { date: '07/01', revenue: 6900 },
]

const stackUsage = [
  { name: 'Next.js + Supabase', count: 1247 },
  { name: 'React Native', count: 892 },
  { name: 'Vue.js', count: 456 },
  { name: 'SvelteKit', count: 252 },
]

export default function AdminDashboard() {
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
      <div>
        <h1 className="text-4xl font-black">
          <span className="gradient-text">Dashboard Admin</span>
        </h1>
        <p className="text-foreground/60 mt-2">Vue d'ensemble de la plateforme SSII AI Studio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus

          return (
            <div key={stat.name} className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  stat.trend === 'up' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                  stat.trend === 'down' ? 'bg-blue-500/10 border border-blue-500/30' :
                  'bg-purple-500/10 border border-purple-500/30'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    stat.trend === 'up' ? 'text-emerald-400' :
                    stat.trend === 'down' ? 'text-blue-400' :
                    'text-purple-400'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  stat.trend === 'down' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                  'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                }`}>
                  <TrendIcon className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-3xl font-black gradient-text">{stat.value}</p>
                <p className="text-sm text-foreground/60 mt-1">{stat.name}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Chart */}
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-6 gradient-text">Projets générés (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projectsData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(263 70% 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(263 70% 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
              <XAxis dataKey="date" stroke="hsl(var(--foreground))" opacity={0.6} />
              <YAxis stroke="hsl(var(--foreground))" opacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
              <Area type="monotone" dataKey="count" stroke="hsl(263 70% 60%)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-6 gradient-text">Revenus (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
              <XAxis dataKey="date" stroke="hsl(var(--foreground))" opacity={0.6} />
              <YAxis stroke="hsl(var(--foreground))" opacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(217 91% 60%)" strokeWidth={3} dot={{ fill: 'hsl(217 91% 60%)', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stack Usage */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 gradient-text">Stacks les plus générées</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stackUsage} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
            <XAxis type="number" stroke="hsl(var(--foreground))" opacity={0.6} />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" opacity={0.6} width={150} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
              }}
            />
            <Bar dataKey="count" fill="hsl(142 76% 56%)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 gradient-text">Activité récente</h3>
        <div className="space-y-4">
          {[
            { time: 'Il y a 2 min', event: 'Nouveau projet généré', user: 'user@example.com', status: 'success' },
            { time: 'Il y a 5 min', event: 'Décision validée', user: 'admin@ssii.ai', status: 'info' },
            { time: 'Il y a 12 min', event: 'Projet déployé', user: 'dev@startup.io', status: 'success' },
            { time: 'Il y a 18 min', event: 'Décision refusée', user: 'user2@test.com', status: 'warning' },
            { time: 'Il y a 24 min', event: 'Nouveau projet généré', user: 'cto@company.com', status: 'success' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 glass rounded-xl border border-white/5 hover:border-white/10 transition-all">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' :
                activity.status === 'warning' ? 'bg-yellow-400 shadow-lg shadow-yellow-500/50' :
                'bg-blue-400 shadow-lg shadow-blue-500/50'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.event}</p>
                <p className="text-xs text-foreground/60">{activity.user}</p>
              </div>
              <p className="text-xs text-foreground/60">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
