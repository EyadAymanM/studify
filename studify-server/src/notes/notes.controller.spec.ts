import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotesController } from './notes.controller.js';
import type { NotesService } from './notes.service.js';

describe('NotesController', () => {
  let controller: NotesController;
  let mockNotesService: Partial<NotesService>;

  beforeEach(() => {
    mockNotesService = {
      create: vi.fn().mockResolvedValue({
        id: 'note-1',
        content: 'Closures retain lexical scope',
        category: 'definition',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [{ id: 'tag-1', name: 'javascript', createdAt: new Date() }],
      }),
      findAll: vi.fn().mockResolvedValue([
        {
          id: 'note-1',
          content: 'Closures retain lexical scope',
          category: 'definition',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [{ id: 'tag-1', name: 'javascript', createdAt: new Date() }],
        },
      ]),
      findById: vi.fn().mockResolvedValue({
        id: 'note-1',
        content: 'Closures retain lexical scope',
        category: 'definition',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      }),
      delete: vi.fn().mockResolvedValue({ success: true, id: 'note-1' }),
      getAllTags: vi.fn().mockResolvedValue([
        { id: 'tag-1', name: 'javascript', createdAt: new Date() },
      ]),
    };

    controller = new NotesController(mockNotesService as NotesService);
  });

  it('should create a note with tags', async () => {
    const result = await controller.create({
      content: 'Closures retain lexical scope',
      category: 'definition',
      tags: ['javascript'],
    });

    expect(result.id).toBe('note-1');
    expect(mockNotesService.create).toHaveBeenCalledWith({
      content: 'Closures retain lexical scope',
      category: 'definition',
      tags: ['javascript'],
    });
  });

  it('should split comma-separated tags and find all notes', async () => {
    const result = await controller.findAll('javascript,web', 'closure');
    expect(result).toHaveLength(1);
    expect(mockNotesService.findAll).toHaveBeenCalledWith(
      ['javascript', 'web'],
      'closure',
    );
  });

  it('should retrieve a single note by id', async () => {
    const result = await controller.findOne('note-1');
    expect(result.id).toBe('note-1');
    expect(mockNotesService.findById).toHaveBeenCalledWith('note-1');
  });

  it('should delete a note by id', async () => {
    const result = await controller.remove('note-1');
    expect(result.success).toBe(true);
    expect(mockNotesService.delete).toHaveBeenCalledWith('note-1');
  });

  it('should list all tags', async () => {
    const tags = await controller.getTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe('javascript');
  });
});
