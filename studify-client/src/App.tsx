import { useState, useEffect, useMemo } from 'react';
import { Cloud, Moon, Sun, BookOpen } from 'lucide-react';
import { SmartInputBar } from './components/SmartInputBar';
import { TagFilters } from './components/TagFilters';
import { NoteCard } from './components/NoteCard';
import { PerformanceHud } from './components/PerformanceHud';
import { fetchNotes, createNote, deleteNote } from './services/api';
import type { Note, Tag, NoteCategory } from './types';

const INITIAL_STARTER_NOTES: Note[] = [
  {
    id: 'starter-1',
    content: 'Closures in JavaScript give you access to an outer function’s scope from an inner function. In JavaScript, closures are created every time a function is created, at function creation time.',
    category: 'definition',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [{ id: '1', name: 'javascript' }, { id: '2', name: 'frontend' }, { id: '3', name: 'web' }],
  },
  {
    id: 'starter-2',
    content: 'Drizzle ORM vs Prisma: Drizzle is a lightweight SQL-like TypeScript ORM with zero code-generation and zero runtime overhead. Prisma uses an external query engine binary and a custom .prisma schema file.',
    category: 'comparison',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [{ id: '4', name: 'backend' }, { id: '5', name: 'databases' }, { id: '6', name: 'architecture' }],
  },
  {
    id: 'starter-3',
    content: 'Docker logical replication in PostgreSQL: Set wal_level = logical to decode WAL stream into row-level events for real-time sync systems like Rocicorp Zero.',
    category: 'note',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [{ id: '7', name: 'devops' }, { id: '8', name: 'databases' }],
  },
];

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('studify_theme') as 'light' | 'dark') || 'light';
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studify_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load notes
  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await fetchNotes();
      if (isMounted) {
        if (data.length > 0) {
          setNotes(data);
        } else {
          // Provide high-quality starter cards if database is fresh
          setNotes(INITIAL_STARTER_NOTES);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddNote = async (input: { content: string; category: NoteCategory; tags: string[] }) => {
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticNote: Note = {
      id: tempId,
      content: input.content,
      category: input.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: input.tags.map((t) => ({ id: `tag-${t}`, name: t })),
    };

    setNotes((prev) => [optimisticNote, ...prev]);

    try {
      const saved = await createNote(input);
      setNotes((prev) => prev.map((n) => (n.id === tempId ? saved : n)));
    } catch {
      // optimisticNote remains visible via local-first fallback
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await deleteNote(id);
  };

  const handleToggleTag = (tagName: string) => {
    const clean = tagName.toLowerCase();
    setActiveTags((prev) =>
      prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean],
    );
  };

  // Gather all unique tags from notes
  const allTags: Tag[] = useMemo(() => {
    const map = new Map<string, Tag>();
    for (const note of notes) {
      for (const t of note.tags || []) {
        if (!map.has(t.name.toLowerCase())) {
          map.set(t.name.toLowerCase(), t);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [notes]);

  // Filter notes by search & active tags
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (activeTags.length > 0) {
        const noteTagNames = (note.tags || []).map((t) => t.name.toLowerCase());
        const hasAllTags = activeTags.every((at) => noteTagNames.includes(at));
        if (!hasAllTags) return false;
      }
      if (search.trim()) {
        const s = search.toLowerCase();
        const matchesContent = note.content.toLowerCase().includes(s);
        const matchesTag = (note.tags || []).some((t) => t.name.toLowerCase().includes(s));
        if (!matchesContent && !matchesTag) return false;
      }
      return true;
    });
  }, [notes, activeTags, search]);

  return (
    <div className="app-container">
      <header className="app-header">
        <a href="/" className="brand-badge" data-testid="brand-logo">
          <div className="brand-icon">
            <Cloud size={20} />
          </div>
          <span>Studify</span>
        </a>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          data-testid="theme-toggle-btn"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      <main>
        <section className="hero-section">
          <h1 className="hero-title">Clear your mind. Master your craft.</h1>
          <p className="hero-subtitle">
            Rapidly capture definitions, code comparisons, and architecture notes with instant real-time sync.
          </p>
        </section>

        {/* Centered Smart Input Bar */}
        <SmartInputBar
          onAddNote={handleAddNote}
          availableTags={allTags.map((t) => t.name)}
        />

        {/* Study & Filtering Section */}
        <section className="study-section">
          <TagFilters
            tags={allTags}
            activeTags={activeTags}
            onToggleTag={handleToggleTag}
            onClearFilters={() => setActiveTags([])}
            search={search}
            onSearchChange={setSearch}
            totalNotes={filteredNotes.length}
          />

          <div className="notes-grid" data-testid="notes-grid">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDeleteNote}
                  onTagClick={handleToggleTag}
                />
              ))
            ) : (
              <div className="empty-state">
                <BookOpen className="empty-state-icon" />
                <h3>No notes found</h3>
                <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>
                  {activeTags.length > 0 || search
                    ? 'Try clearing your active tag filters or search keyword.'
                    : 'Start by capturing your first definition or concept in the bar above!'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating In-App Developer Performance HUD */}
      <PerformanceHud />
    </div>
  );
}

export default App;
