'use client'

import { useState, useEffect } from 'react'
import { Activity, Cpu, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react'

// Mock data - à remplacer par useAgentStatus hook
const agents = [
  {
    id: 'director',
    name: 'Director Agent',
    role: 'Coordination & Planning',
    status: 'active' as const,
    currentTask: 'Analyzing brief for project #2847',
    uptime: '99.9%',
    tasksCompleted: 2847,
    avgTime: '2.3s',
    icon: '🎯',
  },
  {
    id: 'architect',
    name: 'Architect Agent',
    role: 'System Design',
    status: 'active' as const,
    currentTask: 'Designing architecture for FoodApp',
    uptime: '99.7%',
    tasksCompleted: 2847,
    avgTime: '45s',
    icon: '🏗️',
  },
  {
    id: 'developer',
    name: 'Developer Agent',
    role: 'Code Generation',
    status: 'busy' as const,
    currentTask: 'Generating React components',
    uptime: '98.9%',
    tasksCompleted: 2847,
    avgTime: '6.2min',
    icon: '💻',
  },
  {
    id: 'security',
    name: 'Security Agent',
    role: 'Security Audit',
    status: 'active' as const,
    currentTask: 'Scanning dependencies',
    uptime: '99.5%',
    tasksCompleted: 2847,
    avgTime: '1.2min',
    icon: '🛡️',
  },
  {
    id: 'qa',
    name: 'QA Agent',
    role: 'Testing & Quality',
    status: 'idle' as const,
    currentTask: null,
    uptime: '99.8%',
    tasksCompleted: 2847,
    avgTime: '1.5min',
    icon: '🧪',
  },
  {
    id: 'devops',
    name: 'DevOps Agent',
    role: 'Deployment',
    status: 'busy' as const,
    currentTask: 'Deploying to Vercel',
    uptime: '99.6%',
    tasksCompleted: 2847,
    avgTime: '45s',
    icon: '☁️',
  },
]

const recentTasks = [
  { agent: 'Director', task: 'Brief analysis completed', project: 'FoodApp', duration: '2.1s', status: 'success' },
  { agent: 'Architect', task: 'Architecture design', project: 'FoodApp', duration: '42s', status: 'success' },
  { agent: 'Developer', task: 'Code generation', project: 'Dashboard', duration: '5.8min', status: 'success' },
  { agent: 'Security', task: 'Security scan', project: 'E-commerce', duration: '1.3min', status: 'warning' },
  { agent: 'QA', task: 'Test execution', project: 'Blog Platform', duration: '1.2min', status: 'success' },
  { agent: 'DevOps', task: 'Deployment', project: 'Portfolio', duration: '38s', status: 'success' },
]

export default function AgentsPage() {
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

  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'busy').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black">
          <span className="gradient-text">Monitoring des Agents</span>
        </h1>
        <p className="text-foreground/60 mt-2">Supervision en temps réel des 6 agents IA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-black gradient-text">{activeAgents}/6</p>
              <p className="text-sm text-foreground/60">Agents actifs</p>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <Cpu className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-black gradient-text">2,847</p>
              <p className="text-sm text-foreground/60">Tâches traitées</p>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-3xl font-black gradient-text">11.8 min</p>
              <p className="text-sm text-foreground/60">Temps moyen total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{agent.icon}</div>
                <div>
                  <h3 className="font-bold text-foreground">{agent.name}</h3>
                  <p className="text-xs text-foreground/60">{agent.role}</p>
                </div>
              </div>

              {/* Status badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                agent.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                agent.status === 'busy' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 animate-pulse' :
                'bg-gray-500/10 text-gray-400 border border-gray-500/30'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  agent.status === 'active' ? 'bg-emerald-400' :
                  agent.status === 'busy' ? 'bg-yellow-400' :
                  'bg-gray-400'
                }`} />
                {agent.status === 'active' ? 'Actif' : agent.status === 'busy' ? 'Occupé' : 'Idle'}
              </div>
            </div>

            {/* Current Task */}
            <div className="mb-4 p-3 glass rounded-xl border border-white/5">
              <p className="text-xs text-foreground/60 mb-1">Tâche actuelle</p>
              <p className="text-sm font-medium text-foreground">
                {agent.currentTask || 'En attente de tâche...'}
              </p>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Uptime</span>
                <span className="text-sm font-bold gradient-text">{agent.uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Tâches</span>
                <span className="text-sm font-bold gradient-text">{agent.tasksCompleted.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Temps moyen</span>
                <span className="text-sm font-bold gradient-text">{agent.avgTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 gradient-text">Tâches récentes</h3>
        <div className="space-y-3">
          {recentTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-4 p-4 glass rounded-xl border border-white/5 hover:border-white/10 transition-all">
              <div className={`p-2 rounded-lg ${
                task.status === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                {task.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{task.agent}</span>
                  <span className="text-xs text-foreground/40">•</span>
                  <span className="text-sm text-foreground/80">{task.task}</span>
                </div>
                <p className="text-xs text-foreground/60">Projet: {task.project}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10">
                <Clock className="h-3 w-3 text-foreground/60" />
                <span className="text-xs font-medium text-foreground/80">{task.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
