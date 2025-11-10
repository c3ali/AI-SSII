import { openai, MODELS } from '../openai'

export interface ProjectBrief {
  name: string
  brief: string
  stack: string
  budget?: number
  timeline?: number
}

export interface ProjectPlan {
  overview: string
  phases: {
    name: string
    duration: string
    tasks: string[]
  }[]
  architecture: {
    frontend: string
    backend: string
    database: string
    deployment: string
    [key: string]: string
  }
  estimations: {
    duration: string
    complexity: string
    team: string
  }
  techStack: string[]
  risks: string[]
  recommendations: string[]
}

const DIRECTOR_PROMPT = `You are the Director Agent, an expert project manager and technical architect for software projects.

Your role is to analyze project briefs and create comprehensive, actionable project plans.

Given a project brief, you must:
1. Analyze the requirements thoroughly
2. Break down the project into logical phases
3. Estimate timeline and complexity realistically
4. Choose the best technology stack
5. Identify potential risks
6. Provide recommendations

Respond ONLY with valid JSON matching this structure:
{
  "overview": "Brief overview of the project",
  "phases": [
    {
      "name": "Phase name",
      "duration": "X days/weeks",
      "tasks": ["Task 1", "Task 2", ...]
    }
  ],
  "architecture": {
    "frontend": "Technology",
    "backend": "Technology",
    "database": "Technology",
    "deployment": "Platform"
  },
  "estimations": {
    "duration": "Total duration",
    "complexity": "Low/Medium/High",
    "team": "Team composition"
  },
  "techStack": ["Tech 1", "Tech 2", ...],
  "risks": ["Risk 1", "Risk 2", ...],
  "recommendations": ["Recommendation 1", ...]
}

Be specific, technical, and realistic. Consider best practices, scalability, and maintainability.`

export async function generateProjectPlan(brief: ProjectBrief): Promise<ProjectPlan> {
  try {
    const userMessage = `
Project Name: ${brief.name}
Stack: ${brief.stack}
${brief.budget ? `Budget: €${brief.budget}` : ''}
${brief.timeline ? `Timeline: ${brief.timeline} days` : ''}

Description:
${brief.brief}

Please analyze this project and create a comprehensive development plan.`

    const completion = await openai.chat.completions.create({
      model: MODELS.GPT4,
      messages: [
        { role: 'system', content: DIRECTOR_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const plan = JSON.parse(response) as ProjectPlan
    return plan
  } catch (error) {
    console.error('Error generating project plan:', error)
    throw new Error('Failed to generate project plan')
  }
}
