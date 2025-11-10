'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StackCard } from './StackCard'
import { CountdownTimer } from './CountdownTimer'
import { CheckCircle2, DollarSign, Edit3 } from 'lucide-react'

interface DecisionPanelProps {
  projectName: string
  proposal: {
    stack: any
    metrics: {
      cost: number
      lighthouse: number
      security: number
    }
  }
  alternative?: {
    stack: any
    metrics: {
      cost: number
      lighthouse: number
      security: number
    }
  }
  deadline: number
  onApprove: () => void
  onAlternative?: () => void
  onModify: () => void
  loading?: boolean
  responded?: boolean
}

export function DecisionPanel({
  projectName,
  proposal,
  alternative,
  deadline,
  onApprove,
  onAlternative,
  onModify,
  loading,
  responded,
}: DecisionPanelProps) {
  if (responded) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="py-10">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Décision enregistrée !</h2>
            <p className="text-muted-foreground">
              L'équipe d'agents continue le travail avec vos instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            🔍 Décision requise - Projet "{projectName}"
          </CardTitle>
          <CardDescription className="text-base">
            <CountdownTimer deadline={deadline} />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              🤖 L'Architecte propose cette stack technique :
            </h3>
            <StackCard
              title="Proposition principale"
              stack={proposal.stack}
              metrics={proposal.metrics}
            />
          </div>

          {alternative && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                💡 Alternative low-cost proposée :
              </h3>
              <StackCard
                title="Stack simplifiée"
                stack={alternative.stack}
                metrics={alternative.metrics}
                isAlternative
              />
            </div>
          )}

          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">🎯 Que décidez-vous ?</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onApprove}
                disabled={loading}
                size="lg"
                className="flex-1 min-w-[200px]"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Valider cette stack
              </Button>
              {onAlternative && (
                <Button
                  onClick={onAlternative}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                  className="flex-1 min-w-[200px]"
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Choisir l'alternative
                </Button>
              )}
              <Button
                onClick={onModify}
                disabled={loading}
                variant="outline"
                size="lg"
                className="flex-1 min-w-[200px]"
              >
                <Edit3 className="mr-2 h-5 w-5" />
                Modifier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
