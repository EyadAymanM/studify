import { type FC } from 'react';
import { Search, X, Filter } from 'lucide-react';
import type { Tag } from '../types';

interface TagFiltersProps {
  tags: Tag[];
  activeTags: string[];
  onToggleTag: (tagName: string) => void;
  onClearFilters: () => void;
  search: string;
  onSearchChange: (val: string) => void;
  totalNotes: number;
}

export const TagFilters: FC<TagFiltersProps> = ({
  tags,
  activeTags,
  onToggleTag,
  onClearFilters,
  search,
  onSearchChange,
  totalNotes,
}) => {
  return (
    <div className="study-toolbar" data-testid="tag-filters-toolbar">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          className="search-input"
          placeholder="Search your notes or definitions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="search-input"
        />
        {search && (
          <button
            type="button"
            className="delete-btn"
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
            onClick={() => onSearchChange('')}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div className="notes-count-badge">
          Showing <strong>{totalNotes}</strong> {totalNotes === 1 ? 'entry' : 'entries'}
        </div>

        {activeTags.length > 0 && (
          <button
            type="button"
            className="tag-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', borderColor: '#ef4444', color: '#ef4444' }}
            onClick={onClearFilters}
            data-testid="clear-filters-btn"
          >
            <X size={12} /> Clear filters ({activeTags.length})
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Filter size={12} /> Filter tags:
          </span>
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag.name.toLowerCase());
            return (
              <button
                key={tag.id || tag.name}
                type="button"
                className={`tag-pill ${isActive ? 'active' : ''}`}
                onClick={() => onToggleTag(tag.name)}
                data-testid={`filter-tag-${tag.name}`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
