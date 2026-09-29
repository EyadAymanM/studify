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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    <div className="min-h-screen flex flex-col px-4 pb-20 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow)_0%,transparent_60%)]">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto py-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-[var(--text-main)] no-underline" data-testid="brand-logo">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Cloud size={20} />
          </div>
          <span>Studify</span>
        </a>

        <button
          type="button"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-sky-500 hover:border-sky-300 transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          data-testid="theme-toggle-btn"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center my-6 max-w-xl mx-auto">
          <h1 className="hero-title text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-main)] mb-2">
            Clear your mind. Master your craft.
          </h1>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            Rapidly capture definitions, code comparisons, and architecture notes with instant real-time sync.
          </p>
        </section>

        {/* Centered Smart Input Bar */}
        <SmartInputBar
          onAddNote={handleAddNote}
          availableTags={allTags.map((t) => t.name)}
        />

        {/* Study & Filtering Section */}
        <section className="max-w-4xl w-full mx-auto mt-6">
          <TagFilters
            tags={allTags}
            activeTags={activeTags}
            onToggleTag={handleToggleTag}
            onClearFilters={() => setActiveTags([])}
            search={search}
            onSearchChange={setSearch}
            totalNotes={filteredNotes.length}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6" data-testid="notes-grid">
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
              <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
                <BookOpen className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-[var(--text-main)]">No notes found</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {activeTags.length > 0 || search
                    ? 'Try clearing your active tag filters or search keyword.'
                    : 'Start by capturing your first definition or concept in the bar above!'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Developer Performance HUD */}
      <PerformanceHud />
    </div>
  );
}

export default App;
