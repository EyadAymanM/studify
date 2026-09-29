# 04 — Local-First Architecture & Rocicorp Zero Sync

Welcome to part 4 of our study series! In this guide, we dive deep into **Local-First software architecture** and how **Rocicorp Zero (`@rocicorp/zero`)** creates instantaneous, multiplayer, real-time web applications.

---

## 1. The Flaw of Traditional Web Apps

In a traditional REST or GraphQL app:
1. User types a note and clicks "Submit".
2. The UI shows a loading spinner or disables the button.
3. A network request travels across the internet to the server (50–300ms).
4. The server validates, writes to the database, and sends a JSON response.
5. The UI finally unlocks and shows the note.

If the network is flaky, slow, or offline, the app breaks or feels sluggish.

---

## 2. What is Local-First?

**Local-first** flips this model on its head:
> **The client reads and writes to a local database running inside the user's browser, and syncs with the server quietly in the background.**

- **0ms Latency**: Queries never touch the network; they query local memory/storage.
- **Offline Capable**: You can write notes on an airplane or subway without internet.
- **Automatic Sync**: When the network reconnects, deltas sync seamlessly.

---

## 3. How Rocicorp Zero Works Under the Hood

Rocicorp Zero consists of three interconnected pieces:

```text
[ Browser / React App ]
      │
      ▼ (0ms local queries & mutations)
[ In-Browser SQLite / IndexedDB ]  <─── Managed by @rocicorp/zero
      │
      ▲ (WebSocket delta sync)
      │
[ zero-cache (Docker Engine) ]
      │
      ▲ (PostgreSQL Logical Replication Stream)
      │
[ PostgreSQL 15+ (Source of Truth) ]
```

1. **In-Browser SQLite / WASM**: Zero downloads a lightweight embedded SQLite engine (compiled to WebAssembly) directly into your browser tab.
2. **`zero-cache` Daemon**: Runs on your server/Docker. It maintains a warm replica of your Postgres database and handles WebSocket connections with thousands of clients.
3. **Logical Replication**: When the backend inserts a row in PostgreSQL, Postgres pushes that change via WAL to `zero-cache` in sub-milliseconds, which broadcasts it to all active browsers.

---

## 4. Declaring a Zero Schema

In Zero, the client schema mirrors your database tables with TypeScript types:

```typescript
import { createSchema, table, string, number, relationships } from '@rocicorp/zero';

export const notesTable = table('notes')
  .columns({
    id: string(),
    content: string(),
    category: string(),
    createdAt: number(),
    updatedAt: number(),
  })
  .primaryKey('id');

export const tagsTable = table('tags')
  .columns({
    id: string(),
    name: string(),
    createdAt: number(),
  })
  .primaryKey('id');

export const noteTagsTable = table('note_tags')
  .columns({
    id: string(),
    noteId: string(),
    tagId: string(),
    createdAt: number(),
  })
  .primaryKey('id');
```

---

## 5. Reactive UI Hooks

Using `@rocicorp/zero/react`, queries are reactive:
```typescript
const [notes] = useQuery(
  zero.query.notes.where('category', '=', 'definition').orderBy('createdAt', 'desc')
);
```
Whenever a note is inserted or edited (locally or from another user/tab), the React component automatically re-renders instantly without any manual state management or polling!
