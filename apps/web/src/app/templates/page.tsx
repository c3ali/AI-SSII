'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Search, Star, TrendingUp, Clock, ShoppingBag, BarChart, Smartphone, Globe, Database, Box } from 'lucide-react'
import { getTemplateIcon } from '@/lib/utils'
import type { Template, TemplateCategory } from '@/types'

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'ALL'>('ALL')

  const categories: Array<{ value: TemplateCategory | 'ALL'; label: string; icon: JSX.Element }> = [
    { value: 'ALL', label: 'All Templates', icon: <Box className="w-4 h-4" /> },
    { value: 'ECOMMERCE', label: 'E-commerce', icon: <ShoppingBag className="w-4 h-4" /> },
    { value: 'SAAS', label: 'SaaS', icon: <BarChart className="w-4 h-4" /> },
    { value: 'LANDING', label: 'Landing Page', icon: <Globe className="w-4 h-4" /> },
    { value: 'DASHBOARD', label: 'Dashboard', icon: <BarChart className="w-4 h-4" /> },
    { value: 'MOBILE', label: 'Mobile App', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'API', label: 'API/Backend', icon: <Database className="w-4 h-4" /> },
  ]

  const templates: Template[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Complete online store with product catalog, shopping cart, checkout, payment integration, order management, and admin dashboard.',
      category: 'ECOMMERCE',
      stack: 'NEXTJS',
      preview: '/templates/ecommerce.png',
      config: {},
      usageCount: 1250,
      rating: 4.8,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'SaaS Dashboard',
      description: 'Professional SaaS application with analytics, user management, team collaboration, billing integration, and comprehensive admin tools.',
      category: 'SAAS',
      stack: 'NUXT',
      preview: '/templates/saas.png',
      config: {},
      usageCount: 980,
      rating: 4.9,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Mobile Fitness App',
      description: 'Cross-platform fitness tracking application with workout plans, progress monitoring, social features, and health analytics.',
      category: 'MOBILE',
      stack: 'REACT_NATIVE',
      preview: '/templates/fitness.png',
      config: {},
      usageCount: 756,
      rating: 4.7,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Product Landing Page',
      description: 'Modern, responsive landing page with hero section, features showcase, testimonials, pricing tables, and contact forms.',
      category: 'LANDING',
      stack: 'NEXTJS',
      preview: '/templates/landing.png',
      config: {},
      usageCount: 2100,
      rating: 4.6,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Analytics Dashboard',
      description: 'Data visualization dashboard with real-time charts, reports, KPI tracking, and customizable widgets for business intelligence.',
      category: 'DASHBOARD',
      stack: 'NEXTJS',
      preview: '/templates/analytics.png',
      config: {},
      usageCount: 1420,
      rating: 4.9,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'REST API Backend',
      description: 'Production-ready RESTful API with authentication, CRUD operations, database integration, caching, and comprehensive documentation.',
      category: 'API',
      stack: 'NEXTJS',
      preview: '/templates/api.png',
      config: {},
      usageCount: 890,
      rating: 4.7,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularTemplates = [...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, 3)

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Template <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Choose from our curated collection of production-ready templates and customize them with AI assistance
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.icon}
                <span className="ml-2">{category.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Popular Templates */}
        {selectedCategory === 'ALL' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-display mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-electric-blue" />
              Most Popular
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularTemplates.map((template) => (
                <Card key={template.id} className="group bg-gradient-to-br from-electric-blue/10 to-code-purple/10 border-electric-blue/30">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{getTemplateIcon(template.category)}</div>
                      <Badge variant="warning" className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{template.rating}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="info">{template.stack}</Badge>
                      <span className="text-gray-400 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {template.usageCount.toLocaleString()} uses
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full group-hover:scale-105 transition-transform">
                      Use This Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div>
          <h2 className="text-2xl font-bold font-display mb-6">
            {selectedCategory === 'ALL' ? 'All Templates' : `${selectedCategory} Templates`}
            <span className="text-gray-500 text-lg ml-2">({filteredTemplates.length})</span>
          </h2>

          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No templates found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{getTemplateIcon(template.category)}</div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="info">{template.category}</Badge>
                        {template.rating && (
                          <Badge variant="default" className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{template.rating}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Stack:</span>
                        <Badge variant="default">{template.stack}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Used by:</span>
                        <span className="font-medium">{template.usageCount.toLocaleString()} devs</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
