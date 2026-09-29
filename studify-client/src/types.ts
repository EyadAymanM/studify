export type NoteCategory = 'definition' | 'comparison' | 'note';

export interface Tag {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Note {
  id: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface CreateNoteInput {
  content: string;
  category: NoteCategory;
  tags: string[];
}
