import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard } from '@/components/Dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

describe('Dashboard', () => {
  const mockProjects = [
    {
      id: '1',
      name: 'E-commerce Platform',
      status: 'running' as const,
      createdAt: new Date('2024-01-15'),
      progress: 60
    },
    {
      id: '2',
      name: 'Blog Platform',
      status: 'success' as const,
      createdAt: new Date('2024-01-10'),
      progress: 100
    },
    {
      id: '3',
      name: 'Portfolio Site',
      status: 'error' as const,
      createdAt: new Date('2024-01-12'),
      progress: 45
    }
  ];

  it('should render project list', () => {
    render(<Dashboard projects={mockProjects} />);

    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText('Blog Platform')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument();
  });

  it('should display project status', () => {
    render(<Dashboard projects={mockProjects} />);

    expect(screen.getByText(/En cours|Running/i)).toBeInTheDocument();
    expect(screen.getByText(/Succès|Success/i)).toBeInTheDocument();
    expect(screen.getByText(/Erreur|Error/i)).toBeInTheDocument();
  });

  it('should show progress for each project', () => {
    render(<Dashboard projects={mockProjects} />);

    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should filter projects by status', async () => {
    render(<Dashboard projects={mockProjects} />);

    const filterButton = screen.getByRole('button', { name: /filtre|filter/i });
    fireEvent.click(filterButton);

    const runningFilter = screen.getByRole('menuitem', { name: /en cours|running/i });
    fireEvent.click(runningFilter);

    await waitFor(() => {
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      expect(screen.queryByText('Blog Platform')).not.toBeInTheDocument();
    });
  });

  it('should search projects by name', async () => {
    render(<Dashboard projects={mockProjects} />);

    const searchInput = screen.getByPlaceholderText(/rechercher|search/i);
    fireEvent.change(searchInput, { target: { value: 'Blog' } });

    await waitFor(() => {
      expect(screen.getByText('Blog Platform')).toBeInTheDocument();
      expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument();
    });
  });

  it('should sort projects by date', async () => {
    render(<Dashboard projects={mockProjects} />);

    const sortButton = screen.getByRole('button', { name: /tri|sort/i });
    fireEvent.click(sortButton);

    const dateSort = screen.getByRole('menuitem', { name: /date/i });
    fireEvent.click(dateSort);

    await waitFor(() => {
      const projectCards = screen.getAllByRole('article');
      expect(projectCards[0]).toHaveTextContent('E-commerce Platform');
    });
  });

  it('should display empty state when no projects', () => {
    render(<Dashboard projects={[]} />);

    expect(screen.getByText(/aucun projet|no projects/i)).toBeInTheDocument();
  });

  it('should show new project button', () => {
    render(<Dashboard projects={mockProjects} />);

    expect(screen.getByRole('button', { name: /nouveau|new.*project/i })).toBeInTheDocument();
  });

  it('should display project statistics', () => {
    render(<Dashboard projects={mockProjects} />);

    expect(screen.getByText(/3.*projets|projects/i)).toBeInTheDocument();
    expect(screen.getByText(/1.*en cours|running/i)).toBeInTheDocument();
    expect(screen.getByText(/1.*terminé|completed/i)).toBeInTheDocument();
  });

  it('should allow deleting a project', async () => {
    const handleDelete = vi.fn();
    render(<Dashboard projects={mockProjects} onDelete={handleDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /supprimer|delete/i });
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: /confirmer|confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith('1');
    });
  });
});
