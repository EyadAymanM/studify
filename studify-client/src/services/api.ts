import type { Note, Tag, NoteCategory } from '../types';

const API_BASE = 'http://localhost:3000';
const LOCAL_STORAGE_KEY = 'studify_local_notes_backup';

export async function fetchNotes(tags?: string[], search?: string): Promise<Note[]> {
  try {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append('tags', tags.join(','));
    }
    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const url = `${API_BASE}/notes${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: Note[] = await res.json();
    
    // Backup locally for offline resilience
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch {
    // Return cached/offline fallback
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        let parsed: Note[] = JSON.parse(local);
        if (tags && tags.length > 0) {
          const lowerTags = tags.map((t) => t.toLowerCase());
          parsed = parsed.filter((n) =>
            lowerTags.some((lt) => n.tags?.some((t) => t.name.toLowerCase() === lt)),
          );
        }
        if (search && search.trim()) {
          const s = search.toLowerCase();
          parsed = parsed.filter((n) => n.content.toLowerCase().includes(s));
        }
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }
}

export async function createNote(input: {
  content: string;
  category: NoteCategory;
  tags: string[];
}): Promise<Note> {
  const localNote: Note = {
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    content: input.content,
    category: input.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: input.tags.map((t) => ({ id: `tag-${t}`, name: t })),
  };

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const saved: Note = await res.json();
    return saved;
  } catch {
    // If backend isn't running or network dropped, keep local note in backup
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: Note[] = local ? JSON.parse(local) : [];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([localNote, ...existing]));
    return localNote;
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  } catch {
    // Delete from local cache
  }

  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      const existing: Note[] = JSON.parse(local);
      const filtered = existing.filter((n) => n.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  }
  return true;
}

export async function fetchTags(): Promise<Tag[]> {
  try {
    const res = await fetch(`${API_BASE}/tags`);
    if (!res.ok) throw new Error('Tags offline');
    return await res.json();
  } catch {
    return [];
  }
}
