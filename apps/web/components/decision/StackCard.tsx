'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StackCardProps {
  title: string
  stack: {
    frontend?: string
    backend?: string
    mobile?: string
    payment?: string
    maps?: string
    deployment?: string
    cicd?: string
  }
  metrics: {
    cost: number
    lighthouse: number
    security: number
  }
  isAlternative?: boolean
}

export function StackCard({ title, stack, metrics, isAlternative }: StackCardProps) {
  return (
    <Card className={isAlternative ? 'border-yellow-200 bg-yellow-50/30' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {isAlternative && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Low-cost
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {Object.entries(stack).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">💰 Coût estimé</span>
            <span className="text-lg font-bold">{metrics.cost}€/mois</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">⚡ Perf Lighthouse</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${metrics.lighthouse}%` }}
                />
              </div>
              <span className="text-sm font-medium">{metrics.lighthouse}/100</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">🔒 Sécu OWASP</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(metrics.security / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{metrics.security}/10</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
