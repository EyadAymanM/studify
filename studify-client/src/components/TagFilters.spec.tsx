import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagFilters } from './TagFilters';
import type { Tag } from '../types';

const testTags: Tag[] = [
  { id: '1', name: 'frontend' },
  { id: '2', name: 'backend' },
];

describe('TagFilters', () => {
  it('renders search input and total notes count', () => {
    render(
      <TagFilters
        tags={testTags}
        activeTags={[]}
        onToggleTag={vi.fn()}
        onClearFilters={vi.fn()}
        search=""
        onSearchChange={vi.fn()}
        totalNotes={5}
      />
    );

    expect(screen.getByPlaceholderText(/Search your notes/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('#frontend')).toBeInTheDocument();
    expect(screen.getByText('#backend')).toBeInTheDocument();
  });

  it('triggers onToggleTag when filter tag is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <TagFilters
        tags={testTags}
        activeTags={['frontend']}
        onToggleTag={handleToggle}
        onClearFilters={vi.fn()}
        search=""
        onSearchChange={vi.fn()}
        totalNotes={1}
      />
    );

    const backendTag = screen.getByTestId('filter-tag-backend');
    fireEvent.click(backendTag);

    expect(handleToggle).toHaveBeenCalledWith('backend');
  });

  it('triggers onClearFilters when clear filters button is clicked', () => {
    const handleClear = vi.fn();
    render(
      <TagFilters
        tags={testTags}
        activeTags={['frontend']}
        onToggleTag={vi.fn()}
        onClearFilters={handleClear}
        search=""
        onSearchChange={vi.fn()}
        totalNotes={1}
      />
    );

    const clearBtn = screen.getByTestId('clear-filters-btn');
    fireEvent.click(clearBtn);

    expect(handleClear).toHaveBeenCalled();
  });
});
