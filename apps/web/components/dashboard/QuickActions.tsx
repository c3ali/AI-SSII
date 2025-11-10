"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, BookOpen } from "lucide-react"

const actions = [
  {
    title: "New Project",
    description: "Start a new AI-generated project",
    icon: Plus,
    href: "/projects/new",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Templates",
    description: "Browse project templates",
    icon: FileText,
    href: "/templates",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    title: "Documentation",
    description: "Learn how to use the platform",
    icon: BookOpen,
    href: "/docs",
    color: "bg-green-500 hover:bg-green-600",
  },
]

export function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <Link key={action.title} href={action.href}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-lg text-white ${action.color} transition-colors`}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
