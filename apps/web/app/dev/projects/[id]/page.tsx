'use client'

import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

// Mock AI-generated project plan
const mockProject = {
  id: 'demo',
  name: 'E-commerce Platform',
  brief: 'Build a modern e-commerce platform with Next.js, including product catalog, shopping cart, and payment integration',
  status: 'SUCCESS',
  stack: 'NEXTJS',
  createdAt: new Date().toISOString(),

  // AI Generated Plan
  plan: {
    overview: 'Architecture moderne d&apos;une plateforme e-commerce complète',
    phases: [
      {
        name: 'Phase 1 - Setup & Authentication',
        duration: '2 jours',
        tasks: [
          'Configuration Next.js 14 avec App Router',
          'Authentification NextAuth.js',
          'Base de données PostgreSQL + Prisma',
          'Design system avec Tailwind CSS'
        ]
      },
      {
        name: 'Phase 2 - Catalogue Produits',
        duration: '3 jours',
        tasks: [
          'Modèles de données produits',
          'API endpoints CRUD',
          'Interface liste produits',
          'Filtrage et recherche',
          'Upload images (S3)'
        ]
      },
      {
        name: 'Phase 3 - Panier & Checkout',
        duration: '3 jours',
        tasks: [
          'State management panier (Zustand)',
          'Interface panier',
          'Intégration Stripe',
          'Processus de paiement',
          'Confirmation commande'
        ]
      }
    ],
    architecture: {
      frontend: 'Next.js 14, React 18, Tailwind CSS',
      backend: 'Next.js API Routes, Prisma ORM',
      database: 'PostgreSQL (Supabase)',
      payments: 'Stripe',
      storage: 'AWS S3',
      deployment: 'Vercel'
    },
    estimations: {
      duration: '8 jours',
      complexity: 'Moyenne',
      team: '1 développeur full-stack'
    }
  },

  // Generated Architecture
  architecture: {
    diagram: 'Client → Next.js → API Routes → Prisma → PostgreSQL',
    components: [
      'ProductCatalog',
      'ShoppingCart',
      'CheckoutFlow',
      'PaymentProcessor',
      'OrderManagement'
    ]
  },

  // Security Analysis
  security: {
    score: 85,
    recommendations: [
      'Implémenter CSRF protection',
      'Rate limiting sur API',
      'Validation inputs côté serveur',
      'Encryption données sensibles',
      'HTTPS obligatoire en production'
    ]
  }
}

export default function DevProjectPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">
            🤖 Résultat généré par l'IA (Démo)
          </p>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Link href="/dev">
            <Button variant="outline" className="mb-4">← Retour</Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{mockProject.name}</h1>
              <p className="text-gray-600 mt-2">{mockProject.brief}</p>
              <div className="flex gap-3 mt-4">
                <Badge variant="success">{mockProject.status}</Badge>
                <Badge variant="info">{mockProject.stack}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-gray-900">
                {mockProject.plan.estimations.duration}
              </div>
              <div className="text-sm text-gray-600">Durée estimée</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-900">
                {mockProject.plan.estimations.complexity}
              </div>
              <div className="text-sm text-gray-600">Complexité</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-2">🔒</div>
              <div className="text-2xl font-bold text-gray-900">
                {mockProject.security.score}/100
              </div>
              <div className="text-sm text-gray-600">Score sécurité</div>
            </CardContent>
          </Card>
        </div>

        {/* Phases */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📋 Plan de Développement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockProject.plan.phases.map((phase, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {phase.name} <span className="text-sm text-gray-500">({phase.duration})</span>
                  </h3>
                  <ul className="space-y-1">
                    {phase.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🏗️ Architecture Technique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <p className="text-gray-700">{mockProject.plan.architecture.frontend}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend</h4>
                <p className="text-gray-700">{mockProject.plan.architecture.backend}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Base de données</h4>
                <p className="text-gray-700">{mockProject.plan.architecture.database}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Paiements</h4>
                <p className="text-gray-700">{mockProject.plan.architecture.payments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>🔒 Analyse de Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockProject.security.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-yellow-500 mr-2">⚠️</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
