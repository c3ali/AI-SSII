import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AgentCard } from '@/components/AgentCard';

describe('AgentCard', () => {
  it('should display agent name and description', () => {
    render(
      <AgentCard
        name="Director"
        description="Analyse le brief et génère le plan projet"
        status="idle"
        icon={<div data-testid="agent-icon">🎯</div>}
      />
    );

    expect(screen.getByText('Director')).toBeInTheDocument();
    expect(screen.getByText(/Analyse le brief/)).toBeInTheDocument();
    expect(screen.getByTestId('agent-icon')).toBeInTheDocument();
  });

  it('should show running status with pulse animation', () => {
    const { container } = render(
      <AgentCard
        name="Architect"
        description="Conception architecture"
        status="running"
        progress={50}
        icon={<div>🏗️</div>}
      />
    );

    const statusIndicator = container.querySelector('[data-testid="status-dot"]');
    expect(statusIndicator).toHaveClass('animate-pulse');

    expect(screen.getByText(/En cours|Running/i)).toBeInTheDocument();
  });

  it('should display progress percentage', () => {
    render(
      <AgentCard
        name="Developer"
        description="Génération du code"
        status="running"
        progress={75}
        icon={<div>👨‍💻</div>}
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should show success status when completed', () => {
    render(
      <AgentCard
        name="QA"
        description="Tests et qualité"
        status="success"
        progress={100}
        icon={<div>✅</div>}
      />
    );

    expect(screen.getByText(/Succès|Success|Terminé/i)).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should show error status when failed', () => {
    render(
      <AgentCard
        name="Security"
        description="Audit sécurité"
        status="error"
        error="Security vulnerabilities detected"
        icon={<div>🔒</div>}
      />
    );

    expect(screen.getByText(/Erreur|Error|Échec/i)).toBeInTheDocument();
    expect(screen.getByText(/Security vulnerabilities/)).toBeInTheDocument();
  });

  it('should display logs when provided', () => {
    render(
      <AgentCard
        name="DevOps"
        description="Déploiement"
        status="running"
        logs={[
          'Deploying to Vercel...',
          'Building application...',
          'Upload complete'
        ]}
        icon={<div>🚀</div>}
      />
    );

    // Should show last log
    expect(screen.getByText('Upload complete')).toBeInTheDocument();
  });

  it('should expand to show all logs on click', () => {
    render(
      <AgentCard
        name="DevOps"
        description="Déploiement"
        status="running"
        logs={[
          'Log 1',
          'Log 2',
          'Log 3',
          'Log 4'
        ]}
        icon={<div>🚀</div>}
      />
    );

    // Click to expand
    const expandButton = screen.getByRole('button', { name: /logs|détails/i });
    fireEvent.click(expandButton);

    // Should show all logs
    expect(screen.getByText('Log 1')).toBeInTheDocument();
    expect(screen.getByText('Log 2')).toBeInTheDocument();
    expect(screen.getByText('Log 3')).toBeInTheDocument();
    expect(screen.getByText('Log 4')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const handleClick = vi.fn();

    render(
      <AgentCard
        name="Director"
        description="Test"
        status="idle"
        onClick={handleClick}
        icon={<div>🎯</div>}
      />
    );

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show idle status by default', () => {
    render(
      <AgentCard
        name="Architect"
        description="Architecture"
        status="idle"
        icon={<div>🏗️</div>}
      />
    );

    expect(screen.getByText(/En attente|Idle|Prêt/i)).toBeInTheDocument();
  });

  it('should display estimated time when provided', () => {
    render(
      <AgentCard
        name="Developer"
        description="Development"
        status="running"
        estimatedTime={120}
        icon={<div>👨‍💻</div>}
      />
    );

    expect(screen.getByText(/2.*min/i)).toBeInTheDocument();
  });

  it('should show output preview when available', () => {
    render(
      <AgentCard
        name="Director"
        description="Planning"
        status="success"
        output={{
          title: 'E-commerce Platform',
          summary: '5 user stories, 2 weeks timeline'
        }}
        icon={<div>🎯</div>}
      />
    );

    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText(/5 user stories/)).toBeInTheDocument();
  });
});
