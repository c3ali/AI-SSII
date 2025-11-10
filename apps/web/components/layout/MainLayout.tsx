"use client"

import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { Footer } from "./Footer"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "md:pl-64" : "pl-0"
          )}
        >
          <div className="container py-6">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
