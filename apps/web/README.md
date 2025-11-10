# AI-SSII Web Application

Modern, AI-powered application builder with a stunning user interface inspired by VibeCode Pro.

## Features

- 🎨 **Modern UI Design**: Glassmorphism effects, gradient backgrounds, and smooth animations
- 🤖 **AI-Powered**: Multi-agent system for automated application generation
- ⚡ **Real-time Monitoring**: Track agent executions and project metrics in real-time
- 📊 **Quality Metrics**: Code coverage, performance, and security scores
- 🎯 **Template Library**: Pre-built templates for E-commerce, SaaS, Mobile apps, and more
- 🔐 **Type-Safe**: Built with TypeScript for enhanced developer experience

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── layout/      # Layout components
├── lib/             # Utilities and configurations
│   ├── api.ts       # API client
│   └── utils.ts     # Helper functions
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
└── styles/          # Global styles
```

## Pages

- `/` - Landing page with features showcase
- `/dashboard` - User dashboard with projects overview
- `/projects/new` - Create new project with AI
- `/projects/[id]` - Project details with agent monitoring
- `/templates` - Browse template gallery

## Design System

### Colors

- **Deep Space**: `#0a0a0a` - Background
- **Electric Blue**: `#3b82f6` - Primary actions
- **Success Green**: `#10b981` - Success states
- **Warning Amber**: `#f59e0b` - Warnings
- **Code Purple**: `#8b5cf6` - Code/tech elements
- **Error Red**: `#ef4444` - Errors

### Components

All components follow the glassmorphism design pattern with:
- Semi-transparent backgrounds
- Backdrop blur effects
- Smooth transitions and animations
- Consistent spacing and typography

## API Integration

The frontend communicates with the FastAPI backend at `NEXT_PUBLIC_API_URL`.

### Available APIs

- `/api/auth/*` - Authentication
- `/api/projects/*` - Project management
- `/api/executions/*` - Agent executions
- `/api/templates/*` - Template library
- `/api/metrics/*` - Quality metrics

## License

Private - All rights reserved
