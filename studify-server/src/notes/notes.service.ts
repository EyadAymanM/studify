import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, inArray, ilike, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema.js';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import type { CreateNoteDto } from './dto/note.dto.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class NotesService {
  constructor(
    @Inject(DRIZZLE_PROVIDER)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(dto: CreateNoteDto) {
    const noteId = randomUUID();
    const now = new Date();

    const [createdNote] = await this.db
      .insert(schema.notes)
      .values({
        id: noteId,
        content: dto.content.trim(),
        category: dto.category || 'note',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const tagNames = (dto.tags || [])
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const uniqueTagNames = [...new Set(tagNames)];
    const attachedTags: schema.Tag[] = [];

    for (const name of uniqueTagNames) {
      let [existingTag] = await this.db
        .select()
        .from(schema.tags)
        .where(eq(schema.tags.name, name))
        .limit(1);

      if (!existingTag) {
        [existingTag] = await this.db
          .insert(schema.tags)
          .values({
            id: randomUUID(),
            name,
            createdAt: now,
          })
          .returning();
      }

      attachedTags.push(existingTag);

      await this.db
        .insert(schema.noteTags)
        .values({
          id: `${createdNote.id}_${existingTag.id}`,
          noteId: createdNote.id,
          tagId: existingTag.id,
          createdAt: now,
        })
        .onConflictDoNothing();
    }

    return {
      ...createdNote,
      tags: attachedTags,
    };
  }

  async findAll(tagsFilter?: string[], search?: string) {
    const query = this.db.query.notes.findMany({
      orderBy: [desc(schema.notes.createdAt)],
      with: {
        noteTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    const allNotes = await query;

    let result = allNotes.map((note) => ({
      id: note.id,
      content: note.content,
      category: note.category,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      tags: note.noteTags.map((nt) => nt.tag),
    }));

    if (tagsFilter && tagsFilter.length > 0) {
      const normalizedFilter = tagsFilter.map((t) =>
        t.trim().toLowerCase().replace(/^#/, ''),
      );
      result = result.filter((note) =>
        normalizedFilter.some((filterTag) =>
          note.tags.some((t) => t.name.toLowerCase() === filterTag),
        ),
      );
    }

    if (search && search.trim().length > 0) {
      const searchLower = search.trim().toLowerCase();
      result = result.filter((note) =>
        note.content.toLowerCase().includes(searchLower),
      );
    }

    return result;
  }

  async findById(id: string) {
    const note = await this.db.query.notes.findFirst({
      where: eq(schema.notes.id, id),
      with: {
        noteTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }

    return {
      id: note.id,
      content: note.content,
      category: note.category,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      tags: note.noteTags.map((nt) => nt.tag),
    };
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .delete(schema.notes)
      .where(eq(schema.notes.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }

    return { success: true, id };
  }

  async getAllTags() {
    return this.db.select().from(schema.tags).orderBy(schema.tags.name);
  }
}
