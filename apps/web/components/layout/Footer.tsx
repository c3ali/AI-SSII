export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with{" "}
            <span className="font-medium text-foreground">Next.js 14</span> and{" "}
            <span className="font-medium text-foreground">AI Agents</span>
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          © 2024 SSII IA Platform. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
