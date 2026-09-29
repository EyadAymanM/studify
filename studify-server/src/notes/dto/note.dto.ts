export interface CreateNoteDto {
  content: string;
  category?: 'definition' | 'comparison' | 'note';
  tags?: string[];
}

export interface FilterNotesDto {
  tags?: string | string[];
  search?: string;
}
