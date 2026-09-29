import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from './NoteCard';
import type { Note } from '../types';

const testNote: Note = {
  id: 'test-123',
  content: 'Map vs Object in JS: Map preserves key insertion order and allows any key type.',
  category: 'comparison',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [{ id: '1', name: 'javascript' }, { id: '2', name: 'dsa' }],
};

describe('NoteCard', () => {
  it('renders note content, category badge, and tags', () => {
    const handleDelete = vi.fn();
    render(<NoteCard note={testNote} onDelete={handleDelete} />);

    expect(screen.getByText(/Map vs Object in JS/)).toBeInTheDocument();
    expect(screen.getByText('comparison')).toBeInTheDocument();
    expect(screen.getByText('#javascript')).toBeInTheDocument();
    expect(screen.getByText('#dsa')).toBeInTheDocument();
  });

  it('triggers onDelete when trash icon button is clicked', () => {
    const handleDelete = vi.fn();
    render(<NoteCard note={testNote} onDelete={handleDelete} />);

    const deleteBtn = screen.getByTestId('delete-note-test-123');
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith('test-123');
  });

  it('triggers onTagClick when clicking a tag pill', () => {
    const handleTagClick = vi.fn();
    render(<NoteCard note={testNote} onDelete={vi.fn()} onTagClick={handleTagClick} />);

    const tagPill = screen.getByText('#javascript');
    fireEvent.click(tagPill);

    expect(handleTagClick).toHaveBeenCalledWith('javascript');
  });
});
