'use client'

import { useState, useEffect } from 'react'
import { Server, Cpu, HardDrive, Activity, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

// Mock data
const systemMetrics = [
  { name: 'CPU Usage', value: '42%', status: 'healthy' as const, icon: Cpu, data: [45, 42, 48, 44, 42, 39, 42] },
  { name: 'Memory', value: '6.2 GB / 16 GB', status: 'healthy' as const, icon: HardDrive, data: [5.8, 6.0, 6.2, 6.1, 6.2, 6.3, 6.2] },
  { name: 'Disk I/O', value: '125 MB/s', status: 'healthy' as const, icon: Server, data: [120, 125, 122, 128, 125, 124, 125] },
  { name: 'Network', value: '42 Mbps', status: 'healthy' as const, icon: Activity, data: [38, 40, 42, 41, 42, 43, 42] },
]

const services = [
  { name: 'Next.js Frontend', status: 'running' as const, uptime: '99.9%', lastCheck: '30s ago' },
  { name: 'Backend API', status: 'running' as const, uptime: '99.8%', lastCheck: '30s ago' },
  { name: 'Supabase Database', status: 'running' as const, uptime: '99.9%', lastCheck: '30s ago' },
  { name: 'Redis Cache', status: 'running' as const, uptime: '99.7%', lastCheck: '30s ago' },
  { name: 'Vercel Edge', status: 'running' as const, uptime: '100%', lastCheck: '30s ago' },
  { name: 'Stripe Webhooks', status: 'warning' as const, uptime: '98.2%', lastCheck: '2m ago' },
]

const alerts = [
  { severity: 'warning' as const, message: 'High memory usage on worker-3', timestamp: 'Il y a 5 min', resolved: false },
  { severity: 'info' as const, message: 'Scheduled backup completed', timestamp: 'Il y a 15 min', resolved: true },
  { severity: 'error' as const, message: 'Failed webhook delivery to Stripe', timestamp: 'Il y a 1h', resolved: true },
  { severity: 'info' as const, message: 'Database migration applied', timestamp: 'Il y a 2h', resolved: true },
]

export default function MonitoringPage() {
  const [mounted, setMounted] = useState(false)
  const [grafanaUrl] = useState(process.env.NEXT_PUBLIC_GRAFANA_URL || 'https://grafana.yourdomain.com')

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
            <span className="gradient-text">Monitoring Système</span>
          </h1>
          <p className="text-foreground/60 mt-2">Surveillance des performances et de la santé du système</p>
        </div>
        <a
          href={grafanaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 glass-strong rounded-xl border border-white/20 hover:border-purple-500/50 hover:glow transition-all duration-300 flex items-center gap-2 group"
        >
          <Activity className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="font-medium gradient-text">Ouvrir Grafana</span>
        </a>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.name} className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <Icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">{metric.name}</p>
                    <p className="text-lg font-bold gradient-text">{metric.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">OK</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={metric.data.map((val, i) => ({ value: val }))}>
                  <Line type="monotone" dataKey="value" stroke="hsl(263 70% 60%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>

      {/* Services Status */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 gradient-text">Statut des Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.name} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{service.name}</p>
                  <p className="text-xs text-foreground/60 mt-0.5">{service.lastCheck}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                  service.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    service.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'
                  }`} />
                  {service.status === 'running' ? 'Running' : 'Warning'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/60">Uptime</span>
                <span className="text-sm font-bold gradient-text">{service.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 gradient-text">Alertes & Événements</h3>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center gap-4 p-4 glass rounded-xl border border-white/5">
              <div className={`p-2 rounded-lg ${
                alert.severity === 'error' ? 'bg-red-500/10 border border-red-500/30' :
                alert.severity === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                'bg-blue-500/10 border border-blue-500/30'
              }`}>
                <AlertTriangle className={`h-4 w-4 ${
                  alert.severity === 'error' ? 'text-red-400' :
                  alert.severity === 'warning' ? 'text-yellow-400' :
                  'text-blue-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                <p className="text-xs text-foreground/60 mt-0.5">{alert.timestamp}</p>
              </div>
              {alert.resolved && (
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                  Résolu
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grafana Embed (placeholder) */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 gradient-text">Dashboards Grafana</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-6 border border-white/5 h-64 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-12 w-12 text-purple-400 mx-auto mb-3" />
              <p className="text-sm text-foreground/60">Infrastructure Metrics</p>
              <a href={grafanaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block">
                Voir dans Grafana →
              </a>
            </div>
          </div>
          <div className="glass rounded-xl p-6 border border-white/5 h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-3" />
              <p className="text-sm text-foreground/60">Application Performance</p>
              <a href={grafanaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">
                Voir dans Grafana →
              </a>
            </div>
          </div>
        </div>
        <p className="text-xs text-foreground/60 mt-4 text-center">
          💡 Configurez NEXT_PUBLIC_GRAFANA_URL dans vos variables d'environnement pour activer l'intégration complète
        </p>
      </div>
    </div>
  )
}
