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

  // Extract inline tags like #javascript #react from content
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
    // Remove the trailing hashtags from clean display content if desired, or keep them
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
    <div className="smart-input-container" data-testid="smart-input-container">
      <div className="smart-input-box">
        <textarea
          ref={textareaRef}
          className="smart-textarea"
          placeholder="Enter a definition, comparison, or concept... (e.g. 'Closures capture variables from outer scope #javascript #web')"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          data-testid="smart-input-textarea"
        />

        <div className="input-controls">
          <div className="category-selector">
            <button
              type="button"
              className={`category-btn ${category === 'note' ? 'active' : ''}`}
              onClick={() => setCategory('note')}
            >
              Note
            </button>
            <button
              type="button"
              className={`category-btn ${category === 'definition' ? 'active' : ''}`}
              onClick={() => setCategory('definition')}
            >
              Definition
            </button>
            <button
              type="button"
              className={`category-btn ${category === 'comparison' ? 'active' : ''}`}
              onClick={() => setCategory('comparison')}
            >
              Comparison
            </button>
          </div>

          <div className="submit-hint-group">
            <span className="keyboard-hint">Press ↵ to save</span>
            <button
              type="button"
              className="submit-btn"
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

      <div className="quick-tags-container">
        <span className="quick-tags-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TagIcon size={13} /> Quick Tags:
        </span>
        {allDisplayTags.slice(0, 8).map((tag) => {
          const isActive = selectedTags.includes(tag.toLowerCase());
          return (
            <button
              key={tag}
              type="button"
              className={`tag-pill ${isActive ? 'active' : ''}`}
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
