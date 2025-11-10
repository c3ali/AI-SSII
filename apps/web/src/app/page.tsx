import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { NeuralBackground } from '@/components/layout/NeuralBackground'
import { Sparkles, Zap, Code, Shield, BarChart, Rocket } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Generation',
      description: 'Describe your app in natural language and watch AI agents build it for you with modern tech stacks.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Multi-Agent System',
      description: 'Director, Architect, Developer, Security, QA, and DevOps agents work together to deliver quality.',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Full-Stack Templates',
      description: 'Start with professionally designed templates for E-commerce, SaaS, dashboards, and mobile apps.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Security First',
      description: 'Built-in security scanning and best practices enforcement by dedicated security agents.',
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: 'Real-Time Metrics',
      description: 'Monitor code quality, performance, and security scores with comprehensive dashboards.',
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Instant Deployment',
      description: 'Deploy your applications with a single click to production-ready infrastructure.',
    },
  ]

  const templates = [
    {
      category: 'E-commerce',
      icon: '🛍️',
      description: 'Complete online store with cart, payments, and admin dashboard',
      stack: 'Next.js + PostgreSQL',
    },
    {
      category: 'SaaS Dashboard',
      icon: '💼',
      description: 'Analytics dashboard with charts, user management, and billing',
      stack: 'React + Node.js',
    },
    {
      category: 'Mobile App',
      icon: '📱',
      description: 'Cross-platform mobile application with native features',
      stack: 'React Native + Expo',
    },
  ]

  return (
    <div className="min-h-screen bg-deep-space text-white">
      <NeuralBackground />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in duration-1000">
            <div className="inline-flex items-center px-4 py-2 bg-electric-blue/10 border border-electric-blue/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-electric-blue mr-2" />
              <span className="text-sm text-electric-blue font-medium">AI-Powered Application Builder</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 leading-tight">
              Build Apps with{' '}
              <span className="text-gradient">AI Magic</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into fully functional applications in minutes.
              Describe what you want and watch our AI agents build it for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-10 py-5">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Building Now
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="secondary" size="lg" className="text-lg px-10 py-5">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient mb-2">6</div>
              <div className="text-gray-400">AI Agents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient mb-2">5</div>
              <div className="text-gray-400">Tech Stacks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient mb-2">100%</div>
              <div className="text-gray-400">Automated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Why Choose <span className="text-gradient">AI-SSII</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of application development with our AI-powered multi-agent system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group">
                <CardHeader>
                  <div className="feature-icon group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Start with <span className="text-gradient">Templates</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose from our curated collection of templates and customize them with AI assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <Card key={index} className="group cursor-pointer hover:scale-105 transition-transform">
                <CardHeader>
                  <div className="text-6xl mb-4">{template.icon}</div>
                  <CardTitle className="text-2xl">{template.category}</CardTitle>
                  <CardDescription className="text-base">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-electric-blue font-medium">{template.stack}</span>
                    <Button size="sm" variant="ghost">
                      Use Template →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/templates">
              <Button variant="secondary" size="lg">
                View All Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-electric-blue/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Ready to build your next app?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join developers who are building faster with AI-powered automation
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-12 py-6">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold font-display text-gradient mb-4">
            AI-SSII
          </h3>
          <p className="text-gray-400 mb-6">
            Building the future of application development, one AI agent at a time.
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 AI-SSII. All rights reserved. Powered by advanced AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
