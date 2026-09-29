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
    <div className="flex flex-col gap-3.5 mb-6" data-testid="tag-filters-toolbar">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={16} />
          <input
            type="text"
            className="w-full pl-10 pr-9 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-main)] placeholder-slate-400 dark:placeholder-slate-500 outline-none shadow-xs focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 dark:focus:ring-sky-500/20 transition-all"
            placeholder="Search your notes or definitions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="search-input"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
              onClick={() => onSearchChange('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs sm:text-sm text-[var(--text-muted)] font-medium px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xs">
            Showing <strong className="text-[var(--text-main)] font-semibold">{totalNotes}</strong> {totalNotes === 1 ? 'entry' : 'entries'}
          </span>

          {activeTags.length > 0 && (
            <button
              type="button"
              className="font-mono text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              onClick={onClearFilters}
              data-testid="clear-filters-btn"
            >
              <X size={13} /> Clear filters ({activeTags.length})
            </button>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="w-full flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5 mr-1">
            <Filter size={13} className="text-sky-500" /> Filter tags:
          </span>
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag.name.toLowerCase());
            return (
              <button
                key={tag.id || tag.name}
                type="button"
                className={`font-mono text-xs font-medium px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-500/30 font-semibold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] shadow-xs hover:border-sky-300 dark:hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/40'
                }`}
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
