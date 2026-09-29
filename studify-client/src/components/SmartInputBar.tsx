import { useState, useRef, type KeyboardEvent, type FC } from 'react';
import { Send, Tag as TagIcon } from 'lucide-react';
import type { NoteCategory } from '../types';

interface SmartInputBarProps {
  onAddNote: (note: { content: string; category: NoteCategory; tags: string[] }) => void;
  availableTags?: string[];
}

const DEFAULT_POPULAR_TAGS = ['frontend', 'backend', 'web', 'devops', 'databases', 'architecture', 'dsa'];

export const SmartInputBar: FC<SmartInputBarProps> = ({
  onAddNote,
  availableTags = DEFAULT_POPULAR_TAGS,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('note');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const extractInlineTags = (text: string): string[] => {
    const matches = text.match(/#([\w-]+)/g);
    if (!matches) return [];
    return matches.map((t) => t.substring(1).toLowerCase());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleTag = (tagName: string) => {
    const clean = tagName.toLowerCase().replace(/^#/, '');
    setSelectedTags((prev) =>
      prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean]
    );
  };

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const inlineTags = extractInlineTags(trimmed);
    const allTags = [...new Set([...selectedTags, ...inlineTags])];

    onAddNote({
      content: trimmed,
      category,
      tags: allTags,
    });

    setContent('');
    setSelectedTags([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const allDisplayTags = [
    ...new Set([...availableTags, ...selectedTags]),
  ];

  return (
    <div className="max-w-3xl w-full mx-auto mb-8" data-testid="smart-input-container">
      <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-lg shadow-sky-500/5 transition-all focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/15">
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent border-0 outline-none text-base sm:text-lg font-medium text-[var(--text-main)] placeholder-slate-400 dark:placeholder-slate-500 resize-none min-h-[70px] leading-relaxed"
          placeholder="Enter a definition, comparison, or concept... (e.g. 'Closures capture variables from outer scope #javascript #web')"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          data-testid="smart-input-textarea"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-2 border-t border-[var(--border-subtle)]">
          <div className="flex gap-1.5 bg-[var(--bg-surface-subtle)] p-1 rounded-xl w-fit border border-[var(--border-subtle)]">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                category === 'note'
                  ? 'bg-[var(--bg-surface)] text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
              }`}
              onClick={() => setCategory('note')}
            >
              Note
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                category === 'definition'
                  ? 'bg-[var(--bg-surface)] text-sky-700 dark:text-sky-300 shadow-xs border border-sky-200 dark:border-sky-800'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
              }`}
              onClick={() => setCategory('definition')}
            >
              Definition
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                category === 'comparison'
                  ? 'bg-[var(--bg-surface)] text-violet-700 dark:text-violet-300 shadow-xs border border-violet-200 dark:border-violet-800'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
              }`}
              onClick={() => setCategory('comparison')}
            >
              Comparison
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="font-mono text-xs text-[var(--text-faint)]">Press ↵ to save</span>
            <button
              type="button"
              className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-[0.98] text-white font-semibold text-sm px-4.5 py-2 rounded-xl shadow-md shadow-sky-500/25 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
              onClick={handleSubmit}
              disabled={!content.trim()}
              data-testid="submit-note-btn"
            >
              <Send size={15} />
              <span>Capture</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Toggle Tag Pills */}
      <div className="flex items-center gap-2 flex-wrap mt-3 px-1">
        <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
          <TagIcon size={12} className="text-sky-500" /> Quick Tags:
        </span>
        {allDisplayTags.slice(0, 8).map((tag) => {
          const isActive = selectedTags.includes(tag.toLowerCase());
          return (
            <button
              key={tag}
              type="button"
              className={`font-mono text-xs font-medium px-3 py-1 rounded-full border transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-500/30 font-semibold'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] shadow-xs hover:border-sky-300 dark:hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/40'
              }`}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
