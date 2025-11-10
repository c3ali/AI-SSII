# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://ssii-ia.vercel.app/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Sign Up

Create a new user account.

**Endpoint**: `POST /auth/signup`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response**: `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

**Errors**:
- `400` - Validation error
- `409` - Email already exists

#### Login

Authenticate and receive a JWT token.

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

**Errors**:
- `401` - Invalid credentials
- `400` - Validation error

### Projects

#### List Projects

Get all projects for the authenticated user.

**Endpoint**: `GET /projects`

**Query Parameters**:
- `status` (optional): Filter by status (PENDING, RUNNING, SUCCESS, FAILED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or brief

**Response**: `200 OK`
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "E-commerce Platform",
      "brief": "Create an e-commerce platform...",
      "status": "SUCCESS",
      "stack": "NEXTJS",
      "budget": 45,
      "progress": 100,
      "deployUrl": "https://project.vercel.app",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T12:45:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Create Project

Start a new project generation workflow.

**Endpoint**: `POST /projects`

**Request**:
```json
{
  "brief": "Create a blog platform with markdown support and comments",
  "name": "My Blog",
  "options": {
    "stack": "NEXTJS",
    "budget": 40,
    "manualCheckpoints": true,
    "requirements": {
      "owasp": true,
      "lighthouse": true,
      "coverage": 90
    }
  }
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "name": "My Blog",
  "brief": "Create a blog platform...",
  "status": "PENDING",
  "progress": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Errors**:
- `400` - Validation error
- `401` - Unauthorized
- `429` - Rate limit exceeded

#### Get Project

Get details of a specific project.

**Endpoint**: `GET /projects/:id`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "name": "E-commerce Platform",
  "brief": "Create an e-commerce platform...",
  "status": "SUCCESS",
  "stack": "NEXTJS",
  "budget": 45,
  "progress": 100,
  "deployUrl": "https://project.vercel.app",
  "outputs": {
    "director": { ... },
    "architect": { ... },
    "developer": { ... },
    "security": { ... },
    "qa": { ... },
    "devops": { ... }
  },
  "agentExecutions": [
    {
      "id": "uuid",
      "agentName": "director",
      "status": "SUCCESS",
      "startedAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:32:00Z",
      "duration": 120000,
      "tokensUsed": 1500,
      "cost": 0.03
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:45:00Z"
}
```

**Errors**:
- `404` - Project not found
- `401` - Unauthorized
- `403` - Forbidden (not your project)

#### Update Project

Update project details.

**Endpoint**: `PATCH /projects/:id`

**Request**:
```json
{
  "name": "Updated Name",
  "brief": "Updated brief..."
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "brief": "Updated brief...",
  "status": "PENDING",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Errors**:
- `400` - Validation error
- `404` - Project not found
- `403` - Cannot update running project

#### Delete Project

Delete a project.

**Endpoint**: `DELETE /projects/:id`

**Response**: `204 No Content`

**Errors**:
- `404` - Project not found
- `403` - Forbidden
- `409` - Cannot delete running project

#### Cancel Project

Cancel a running project workflow.

**Endpoint**: `POST /projects/:id/cancel`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "status": "CANCELLED",
  "updatedAt": "2024-01-15T11:05:00Z"
}
```

**Errors**:
- `404` - Project not found
- `400` - Project not running

### Agent Executions

#### List Agent Executions

Get all agent executions for a project.

**Endpoint**: `GET /projects/:id/agents`

**Response**: `200 OK`
```json
{
  "executions": [
    {
      "id": "uuid",
      "agentName": "director",
      "status": "SUCCESS",
      "input": { ... },
      "output": { ... },
      "startedAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:32:00Z",
      "duration": 120000,
      "tokensUsed": 1500,
      "cost": 0.03
    }
  ]
}
```

#### Get Agent Execution

Get details of a specific agent execution.

**Endpoint**: `GET /agents/:id`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "agentName": "architect",
  "status": "SUCCESS",
  "input": {
    "userStories": [...],
    "timeline": 2,
    "budget": 45
  },
  "output": {
    "stack": "NEXTJS",
    "frontend": { ... },
    "backend": { ... },
    "database": { ... }
  },
  "startedAt": "2024-01-15T10:32:00Z",
  "completedAt": "2024-01-15T10:35:00Z",
  "duration": 180000,
  "tokensUsed": 2500,
  "cost": 0.05
}
```

### Checkpoints

#### List Checkpoints

Get all checkpoints for a project.

**Endpoint**: `GET /projects/:id/checkpoints`

**Response**: `200 OK`
```json
{
  "checkpoints": [
    {
      "id": "uuid",
      "agentName": "architect",
      "data": { ... },
      "approved": true,
      "feedback": "Architecture looks good",
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

#### Approve Checkpoint

Approve or reject a checkpoint.

**Endpoint**: `POST /checkpoints/:id/approve`

**Request**:
```json
{
  "approved": true,
  "feedback": "Looks great, proceed"
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "approved": true,
  "feedback": "Looks great, proceed",
  "updatedAt": "2024-01-15T10:36:00Z"
}
```

### Stats

#### Get User Stats

Get statistics for the authenticated user.

**Endpoint**: `GET /stats`

**Response**: `200 OK`
```json
{
  "projects": {
    "total": 25,
    "pending": 2,
    "running": 3,
    "success": 18,
    "failed": 2
  },
  "costs": {
    "total": 245.50,
    "thisMonth": 45.30
  },
  "agents": {
    "totalExecutions": 150,
    "averageDuration": 125000,
    "successRate": 0.95
  }
}
```

## WebSocket API

### Connection

Connect to WebSocket for real-time updates.

**URL**: `ws://localhost:3000/api/ws` (dev) or `wss://ssii-ia.vercel.app/api/ws` (prod)

**Authentication**:
```javascript
const socket = io('wss://ssii-ia.vercel.app', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Events

#### Client → Server

**Join Project Room**:
```javascript
socket.emit('join:project', { projectId: 'uuid' });
```

**Leave Project Room**:
```javascript
socket.emit('leave:project', { projectId: 'uuid' });
```

#### Server → Client

**Agent Started**:
```javascript
socket.on('agent:start', (data) => {
  // data: { projectId, agentName, startedAt }
});
```

**Agent Progress**:
```javascript
socket.on('agent:progress', (data) => {
  // data: { projectId, agentName, progress, message }
});
```

**Agent Completed**:
```javascript
socket.on('agent:complete', (data) => {
  // data: { projectId, agentName, output, duration }
});
```

**Agent Error**:
```javascript
socket.on('agent:error', (data) => {
  // data: { projectId, agentName, error }
});
```

**Checkpoint Required**:
```javascript
socket.on('checkpoint:required', (data) => {
  // data: { projectId, checkpointId, agentName, data }
});
```

**Workflow Complete**:
```javascript
socket.on('workflow:complete', (data) => {
  // data: { projectId, status, deployUrl }
});
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

- **Anonymous**: 20 requests/minute
- **Authenticated**: 100 requests/minute
- **Project Creation**: 5 per hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641024000
```

## Pagination

List endpoints support pagination:

```
GET /api/projects?page=2&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 2,
    "limit": 20,
    "pages": 5
  }
}
```

## Filtering & Sorting

### Filtering

```
GET /api/projects?status=SUCCESS&stack=NEXTJS
```

### Sorting

```
GET /api/projects?sort=-createdAt
```

Use `-` prefix for descending order.

## Examples

### Complete Flow Example (cURL)

#### 1. Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### 2. Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "brief": "Create a blog platform",
    "name": "My Blog"
  }'
```

#### 3. Get Project Status
```bash
curl http://localhost:3000/api/projects/<project-id> \
  -H "Authorization: Bearer <token>"
```

### JavaScript SDK Example

```javascript
import { SSIIClient } from '@ssii-ia/client';

const client = new SSIIClient({
  apiUrl: 'https://ssii-ia.vercel.app/api',
  token: 'your-jwt-token'
});

// Create project
const project = await client.projects.create({
  brief: 'Create a blog platform with markdown',
  name: 'My Blog'
});

// Listen to real-time updates
client.projects.subscribe(project.id, {
  onProgress: (data) => console.log('Progress:', data),
  onComplete: (data) => console.log('Complete:', data),
  onError: (error) => console.error('Error:', error)
});

// Get project
const updated = await client.projects.get(project.id);
console.log('Status:', updated.status);
```

---

**Version**: 1.0.0
**Last Updated**: 2025-01-10
