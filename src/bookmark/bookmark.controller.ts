import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkDto } from './dto';

@Controller('api/v1/bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Post('')
  @HttpCode(201)
  create(@Body() dto: BookmarkDto) {
    return this.bookmarkService.create(dto);
  }

  @Get('')
  @HttpCode(200)
  getBookmarks() {
    return this.bookmarkService.getBookmarks();
  }

  @Get(':id')
  @HttpCode(200)
  getBookmark(@Param('id', ParseIntPipe) id: number) {
    return this.bookmarkService.getBookmark(id);
  }

  @Patch(':id')
  @HttpCode(200)
  update(@Param('id', ParseIntPipe) id: number, dto: BookmarkDto) {
    return this.bookmarkService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.bookmarkService.delete(id);
  }
}
