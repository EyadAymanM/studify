import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service.js';
import type { CreateNoteDto } from './dto/note.dto.js';

@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('notes')
  async create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(createNoteDto);
  }

  @Get('notes')
  async findAll(
    @Query('tags') tags?: string | string[],
    @Query('search') search?: string,
  ) {
    let parsedTags: string[] | undefined;
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t) => t.trim());
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    return this.notesService.findAll(parsedTags, search);
  }

  @Get('notes/:id')
  async findOne(@Param('id') id: string) {
    return this.notesService.findById(id);
  }

  @Delete('notes/:id')
  async remove(@Param('id') id: string) {
    return this.notesService.delete(id);
  }

  @Get('tags')
  async getTags() {
    return this.notesService.getAllTags();
  }
}
