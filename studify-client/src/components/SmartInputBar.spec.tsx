import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartInputBar } from './SmartInputBar';

describe('SmartInputBar', () => {
  it('renders input bar and allows note entry', () => {
    const handleAddNote = vi.fn();
    render(<SmartInputBar onAddNote={handleAddNote} />);

    const textarea = screen.getByTestId('smart-input-textarea');
    expect(textarea).toBeInTheDocument();

    const submitBtn = screen.getByTestId('submit-note-btn');
    expect(submitBtn).toBeDisabled();
  });

  it('submits note with inline extracted tags and category on Enter', () => {
    const handleAddNote = vi.fn();
    render(<SmartInputBar onAddNote={handleAddNote} />);

    const textarea = screen.getByTestId('smart-input-textarea');
    fireEvent.change(textarea, {
      target: { value: 'TypeScript provides static typing #typescript #frontend' },
    });

    const defBtn = screen.getByText('Definition');
    fireEvent.click(defBtn);

    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    expect(handleAddNote).toHaveBeenCalledWith({
      content: 'TypeScript provides static typing #typescript #frontend',
      category: 'definition',
      tags: ['typescript', 'frontend'],
    });
  });

  it('toggles quick tag pills and includes them on submit', () => {
    const handleAddNote = vi.fn();
    render(<SmartInputBar onAddNote={handleAddNote} availableTags={['web', 'backend']} />);

    const tagPill = screen.getByText('#web');
    fireEvent.click(tagPill);

    const textarea = screen.getByTestId('smart-input-textarea');
    fireEvent.change(textarea, { target: { value: 'HTTP/3 uses QUIC' } });

    const submitBtn = screen.getByTestId('submit-note-btn');
    fireEvent.click(submitBtn);

    expect(handleAddNote).toHaveBeenCalledWith({
      content: 'HTTP/3 uses QUIC',
      category: 'note',
      tags: ['web'],
    });
  });
});
