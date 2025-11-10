import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorkflowGraph } from '@/components/WorkflowGraph';

describe('WorkflowGraph', () => {
  const mockAgents = [
    { name: 'director', status: 'success' as const },
    { name: 'architect', status: 'running' as const },
    { name: 'developer', status: 'idle' as const },
    { name: 'security', status: 'idle' as const },
    { name: 'qa', status: 'idle' as const },
    { name: 'devops', status: 'idle' as const }
  ];

  it('should render all agent nodes', () => {
    render(<WorkflowGraph agents={mockAgents} />);

    expect(screen.getByText(/director/i)).toBeInTheDocument();
    expect(screen.getByText(/architect/i)).toBeInTheDocument();
    expect(screen.getByText(/developer/i)).toBeInTheDocument();
    expect(screen.getByText(/security/i)).toBeInTheDocument();
    expect(screen.getByText(/qa/i)).toBeInTheDocument();
    expect(screen.getByText(/devops/i)).toBeInTheDocument();
  });

  it('should display connections between agents', () => {
    const { container } = render(<WorkflowGraph agents={mockAgents} />);

    const connections = container.querySelectorAll('[data-testid="agent-connection"]');
    expect(connections.length).toBeGreaterThan(0);
  });

  it('should highlight active agent', () => {
    const { container } = render(<WorkflowGraph agents={mockAgents} />);

    const architectNode = container.querySelector('[data-agent="architect"]');
    expect(architectNode).toHaveClass(/active|running/);
  });

  it('should show completed agents with success style', () => {
    const { container } = render(<WorkflowGraph agents={mockAgents} />);

    const directorNode = container.querySelector('[data-agent="director"]');
    expect(directorNode).toHaveClass(/success|completed/);
  });

  it('should show idle agents with default style', () => {
    const { container } = render(<WorkflowGraph agents={mockAgents} />);

    const developerNode = container.querySelector('[data-agent="developer"]');
    expect(developerNode).not.toHaveClass(/active|success|error/);
  });

  it('should display error state for failed agents', () => {
    const agentsWithError = [
      ...mockAgents.slice(0, 3),
      { name: 'security', status: 'error' as const },
      ...mockAgents.slice(4)
    ];

    const { container } = render(<WorkflowGraph agents={agentsWithError} />);

    const securityNode = container.querySelector('[data-agent="security"]');
    expect(securityNode).toHaveClass(/error|failed/);
  });

  it('should show flow direction from top to bottom', () => {
    const { container } = render(<WorkflowGraph agents={mockAgents} />);

    const graph = container.querySelector('[data-testid="workflow-graph"]');
    expect(graph).toHaveStyle({ flexDirection: 'column' });
  });
});
