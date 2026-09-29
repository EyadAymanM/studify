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

  return (
    <div className="note-card" data-testid={`note-card-${note.id}`}>
      <div className="note-header">
        <span className={`category-badge ${note.category}`}>
          {note.category}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            className="delete-btn"
            title="Copy note"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          </button>
          <button
            type="button"
            className="delete-btn"
            title="Delete note"
            onClick={() => onDelete(note.id)}
            data-testid={`delete-note-${note.id}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="note-content">{note.content}</div>

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag) => (
            <span
              key={tag.id || tag.name}
              className="note-tag"
              style={{ cursor: onTagClick ? 'pointer' : 'default' }}
              onClick={() => onTagClick && onTagClick(tag.name)}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {formatDate(note.createdAt)}
      </div>
    </div>
  );
};
