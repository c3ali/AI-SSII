import { MainLayout } from "@/components/layout/MainLayout"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { AgentStatusGrid } from "@/components/dashboard/AgentStatusGrid"
import { RecentProjects } from "@/components/dashboard/RecentProjects"
import { QuickActions } from "@/components/dashboard/QuickActions"

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your AI-powered projects.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Agent Status & Recent Projects */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AgentStatusGrid />
          <RecentProjects />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <QuickActions />
        </div>
      </div>
    </MainLayout>
  )
}
