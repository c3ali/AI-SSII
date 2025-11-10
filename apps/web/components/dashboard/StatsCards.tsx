"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Activity, CheckCircle2, Clock } from "lucide-react"

const stats = [
  {
    title: "Active Projects",
    value: "12",
    change: "+2 this week",
    icon: FolderKanban,
    color: "text-blue-600",
  },
  {
    title: "Agents Running",
    value: "6",
    change: "All systems operational",
    icon: Activity,
    color: "text-green-600",
  },
  {
    title: "Success Rate",
    value: "94%",
    change: "+5% from last month",
    icon: CheckCircle2,
    color: "text-purple-600",
  },
  {
    title: "Avg. Time",
    value: "2.4h",
    change: "-0.5h improvement",
    icon: Clock,
    color: "text-orange-600",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
