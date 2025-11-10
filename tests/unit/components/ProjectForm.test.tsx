import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectForm } from '@/components/ProjectForm';

describe('ProjectForm', () => {
  it('should render all form steps', () => {
    render(<ProjectForm onSubmit={vi.fn()} />);

    expect(screen.getByText(/Brief|Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brief/i)).toBeInTheDocument();
  });

  it('should validate required brief field', async () => {
    const handleSubmit = vi.fn();
    render(<ProjectForm onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole('button', { name: /suivant|next/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/brief.*requis|required/i)).toBeInTheDocument();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should accept valid brief and move to next step', async () => {
    render(<ProjectForm onSubmit={vi.fn()} />);

    const briefInput = screen.getByLabelText(/brief/i);
    fireEvent.change(briefInput, {
      target: { value: 'Create an e-commerce platform with Stripe' }
    });

    const nextButton = screen.getByRole('button', { name: /suivant|next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Configuration|Stack/i)).toBeInTheDocument();
    });
  });

  it('should allow stack selection', async () => {
    render(<ProjectForm onSubmit={vi.fn()} />);

    // Navigate to configuration step
    const briefInput = screen.getByLabelText(/brief/i);
    fireEvent.change(briefInput, { target: { value: 'Test project' } });
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/stack/i)).toBeInTheDocument();
    });

    const stackSelect = screen.getByLabelText(/stack/i);
    fireEvent.change(stackSelect, { target: { value: 'NEXTJS' } });

    expect(stackSelect).toHaveValue('NEXTJS');
  });

  it('should validate budget constraints', async () => {
    render(<ProjectForm onSubmit={vi.fn()} />);

    // Navigate to configuration
    const briefInput = screen.getByLabelText(/brief/i);
    fireEvent.change(briefInput, { target: { value: 'Test project' } });
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    await waitFor(() => {
      const budgetInput = screen.getByLabelText(/budget/i);
      fireEvent.change(budgetInput, { target: { value: '100' } });
    });

    await waitFor(() => {
      expect(screen.getByText(/budget.*50/i)).toBeInTheDocument();
    });
  });

  it('should allow selecting requirements', async () => {
    render(<ProjectForm onSubmit={vi.fn()} />);

    // Navigate to requirements step
    const briefInput = screen.getByLabelText(/brief/i);
    fireEvent.change(briefInput, { target: { value: 'Test project' } });
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    await waitFor(() => screen.getByLabelText(/stack/i));
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    await waitFor(() => {
      const owaspCheckbox = screen.getByLabelText(/OWASP|sécurité/i);
      expect(owaspCheckbox).toBeInTheDocument();
      fireEvent.click(owaspCheckbox);
      expect(owaspCheckbox).toBeChecked();
    });
  });

  it('should display project summary before submission', async () => {
    render(<ProjectForm onSubmit={vi.fn()} />);

    // Fill all steps
    const briefInput = screen.getByLabelText(/brief/i);
    fireEvent.change(briefInput, { target: { value: 'E-commerce platform' } });
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    await waitFor(() => screen.getByLabelText(/stack/i));
    const stackSelect = screen.getByLabelText(/stack/i);
    fireEvent.change(stackSelect, { target: { value: 'NEXTJS' } });
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    await waitFor(() => screen.getByLabelText(/OWASP/i));
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    // Should show summary
    await waitFor(() => {
      expect(screen.getByText(/résumé|summary/i)).toBeInTheDocument();
      expect(screen.getByText('E-commerce platform')).toBeInTheDocument();
      expect(screen.getByText(/NEXTJS|Next\.js/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data', async () => {
    const handleSubmit = vi.fn();
    render(<ProjectForm onSubmit={handleSubmit} />);

    // Fill brief
    const briefInput = screen.getByLabelText(/brief/i);
    fireEvent.change(briefInput, {
      target: { value: 'Create e-commerce platform' }
    });
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    // Fill stack
    await waitFor(() => screen.getByLabelText(/stack/i));
    const stackSelect = screen.getByLabelText(/stack/i);
    fireEvent.change(stackSelect, { target: { value: 'NEXTJS' } });
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    // Skip requirements
    await waitFor(() => screen.getByLabelText(/OWASP/i));
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    // Submit
    await waitFor(() => screen.getByRole('button', { name: /lancer|launch/i }));
    const launchButton = screen.getByRole('button', { name: /lancer|launch/i });
    fireEvent.click(launchButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          brief: 'Create e-commerce platform',
          stack: 'NEXTJS'
        })
      );
    });
  });

  it('should allow going back to previous steps', async () => {
    render(<ProjectForm onSubmit={vi.fn()} />);

    // Go to step 2
    const briefInput = screen.getByLabelText(/brief/i);
    fireEvent.change(briefInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));

    // Go back
    await waitFor(() => screen.getByRole('button', { name: /retour|back/i }));
    const backButton = screen.getByRole('button', { name: /retour|back/i });
    fireEvent.click(backButton);

    // Should be back at step 1
    expect(screen.getByLabelText(/brief/i)).toHaveValue('Test');
  });

  it('should save draft', async () => {
    const handleSaveDraft = vi.fn();
    render(<ProjectForm onSubmit={vi.fn()} onSaveDraft={handleSaveDraft} />);

    const briefInput = screen.getByLabelText(/brief/i);
    fireEvent.change(briefInput, { target: { value: 'Draft project' } });

    const saveDraftButton = screen.getByRole('button', { name: /brouillon|draft/i });
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(handleSaveDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          brief: 'Draft project'
        })
      );
    });
  });
});
