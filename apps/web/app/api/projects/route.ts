import { NextRequest, NextResponse } from "next/server"

// Mock data - in production this would connect to a database
const mockProjects = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "Full-stack e-commerce solution",
    status: "in_progress",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Mobile Banking App",
    description: "Secure mobile banking application",
    status: "review",
    createdAt: "2024-01-10T00:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        items: mockProjects,
        total: mockProjects.length,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch projects",
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.brief) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required fields",
          },
        },
        { status: 400 }
      )
    }

    // Create new project
    const newProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name,
      description: body.description || "",
      brief: body.brief,
      status: "pending",
      createdAt: new Date().toISOString(),
      config: body.config || {},
    }

    return NextResponse.json(
      {
        success: true,
        data: newProject,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create project",
        },
      },
      { status: 500 }
    )
  }
}
