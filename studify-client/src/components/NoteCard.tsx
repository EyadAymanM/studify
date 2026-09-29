import { useState, type FC } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onTagClick?: (tagName: string) => void;
}

export const NoteCard: FC<NoteCardProps> = ({ note, onDelete, onTagClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'definition':
        return {
          pill: 'bg-sky-50 text-sky-700 border-sky-200/90 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80 shadow-[0_1px_2px_rgba(2,132,199,0.06)]',
          dot: 'bg-sky-500 dark:bg-sky-400',
        };
      case 'comparison':
        return {
          pill: 'bg-violet-50 text-violet-700 border-violet-200/90 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/80 shadow-[0_1px_2px_rgba(124,58,237,0.06)]',
          dot: 'bg-violet-500 dark:bg-violet-400',
        };
      default:
        return {
          pill: 'bg-slate-100/90 text-slate-700 border-slate-200/90 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
          dot: 'bg-slate-400 dark:bg-slate-500',
        };
    }
  };

  const badge = getCategoryBadge(note.category);

  return (
    <div
      className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500/60 transition-all flex flex-col justify-between hover:-translate-y-0.5 group"
      data-testid={`note-card-${note.id}`}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
          {note.category}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="text-[var(--text-faint)] hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-all cursor-pointer"
            title="Copy note"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
          <button
            type="button"
            className="text-[var(--text-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 rounded-lg transition-all cursor-pointer"
            title="Delete note"
            onClick={() => onDelete(note.id)}
            data-testid={`delete-note-${note.id}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed mb-4 break-words font-medium">
        {note.content}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-[var(--border-subtle)]">
          {note.tags.map((tag) => (
            <span
              key={tag.id || tag.name}
              className="font-mono text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50/90 dark:bg-sky-950/50 border border-sky-200/70 dark:border-sky-900/60 hover:border-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/70 px-2 py-0.5 rounded-md transition-all cursor-pointer"
              onClick={() => onTagClick && onTagClick(tag.name)}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-2 text-[10px] font-mono text-[var(--text-faint)]">
        {formatDate(note.createdAt)}
      </div>
    </div>
  );
};
