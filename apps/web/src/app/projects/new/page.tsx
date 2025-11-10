'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Sparkles, Loader2, CheckCircle, Code, Layers, Clock, DollarSign } from 'lucide-react'
import type { StackType, TemplateCategory } from '@/types'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<'brief' | 'analyzing' | 'preview'>('brief')
  const [isGenerating, setIsGenerating] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    brief: '',
    stack: 'NEXTJS' as StackType,
    budget: '',
    timeline: '',
  })

  const [analysis, setAnalysis] = useState({
    features: [] as string[],
    techStack: [] as string[],
    estimatedTime: '',
    complexity: '',
  })

  const stackOptions = [
    { value: 'NEXTJS', label: 'Next.js (React)' },
    { value: 'NUXT', label: 'Nuxt (Vue.js)' },
    { value: 'REACT_NATIVE', label: 'React Native' },
    { value: 'EXPO', label: 'Expo (React Native)' },
    { value: 'FLUTTER', label: 'Flutter' },
  ]

  const handleAnalyze = async () => {
    setIsGenerating(true)
    setStep('analyzing')

    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        features: [
          'User authentication with JWT',
          'RESTful API endpoints',
          'PostgreSQL database integration',
          'Responsive UI design',
          'Real-time updates',
          'Admin dashboard',
        ],
        techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Prisma ORM', 'Redis'],
        estimatedTime: '7-10 days',
        complexity: 'Medium',
      })
      setStep('preview')
      setIsGenerating(false)
    }, 3000)
  }

  const handleCreate = async () => {
    setIsGenerating(true)
    // Simulate project creation
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold font-display mb-4">
            Create New <span className="text-gradient">AI Project</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Describe your application and let AI agents build it for you
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'brief' ? 'text-electric-blue' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'brief' ? 'bg-electric-blue/20 border-2 border-electric-blue' : 'bg-gray-800'}`}>
                <Code className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Project Brief</span>
            </div>

            <div className="w-16 h-0.5 bg-gray-700"></div>

            <div className={`flex items-center ${step === 'analyzing' ? 'text-electric-blue' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'analyzing' ? 'bg-electric-blue/20 border-2 border-electric-blue' : 'bg-gray-800'}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">AI Analysis</span>
            </div>

            <div className="w-16 h-0.5 bg-gray-700"></div>

            <div className={`flex items-center ${step === 'preview' ? 'text-electric-blue' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-electric-blue/20 border-2 border-electric-blue' : 'bg-gray-800'}`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Review & Create</span>
            </div>
          </div>
        </div>

        {/* Step 1: Project Brief */}
        {step === 'brief' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Tell us about your project</CardTitle>
              <CardDescription>
                Provide details about your application and we'll analyze it with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Input
                  label="Project Name"
                  placeholder="e.g., E-commerce Platform"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  icon={<Layers className="w-4 h-4" />}
                />

                <Textarea
                  label="Project Description"
                  placeholder="Describe your application in detail: What does it do? Who is it for? What features should it have?"
                  rows={6}
                  value={formData.brief}
                  onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                />

                <Select
                  label="Preferred Tech Stack"
                  options={stackOptions}
                  value={formData.stack}
                  onChange={(e) => setFormData({ ...formData, stack: e.target.value as StackType })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Budget (Optional)"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    icon={<DollarSign className="w-4 h-4" />}
                  />

                  <Input
                    label="Timeline (Days, Optional)"
                    type="number"
                    placeholder="e.g., 14"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    icon={<Clock className="w-4 h-4" />}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="ghost" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!formData.name || !formData.brief}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze with AI
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: AI Analyzing */}
        {step === 'analyzing' && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-electric-blue/20 rounded-full mb-6">
                  <Loader2 className="w-10 h-10 text-electric-blue animate-spin" />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI is analyzing your project...</h3>
                <p className="text-gray-400 mb-6">
                  Our AI agents are reviewing your requirements and planning the architecture
                </p>
                <div className="space-y-2 max-w-md mx-auto">
                  {[
                    'Analyzing project requirements',
                    'Planning system architecture',
                    'Selecting optimal tech stack',
                    'Estimating complexity and timeline',
                  ].map((task, index) => (
                    <div key={index} className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-success-green" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preview & Create */}
        {step === 'preview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">AI Analysis Results</CardTitle>
                <CardDescription>
                  Review the analysis and confirm to start building
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Project Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Layers className="w-4 h-4 mr-2 text-electric-blue" />
                      Project Information
                    </h4>
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stack:</span>
                        <Badge variant="info">{formData.stack}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Complexity:</span>
                        <Badge variant="warning">{analysis.complexity}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Time:</span>
                        <span className="font-medium">{analysis.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-success-green" />
                      Detected Features ({analysis.features.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-white/5 rounded-lg p-3">
                          <CheckCircle className="w-4 h-4 text-success-green mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Code className="w-4 h-4 mr-2 text-code-purple" />
                      Recommended Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.techStack.map((tech, index) => (
                        <Badge key={index} variant="default">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('brief')}>
                ← Back to Edit
              </Button>
              <Button onClick={handleCreate} isLoading={isGenerating}>
                {isGenerating ? (
                  'Creating Project...'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Building
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
