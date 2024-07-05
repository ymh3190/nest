import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async create(dto: BookmarkDto) {
    // check request userId
    const bookmark = await this.prisma.bookmark.create({
      data: {
        ...dto,
        userId: 2,
      },
    });
    return bookmark;
  }

  async getBookmarks() {
    const bookmarks = await this.prisma.bookmark.findMany();
    return bookmarks;
  }

  async getBookmark(id: number) {
    // check bookmark's owner
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id,
      },
    });
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  async update(id: number, dto: BookmarkDto) {
    const bookmark = await this.prisma.bookmark.update({
      where: {
        id,
      },
      data: { ...dto },
    });

    return bookmark;
  }

  async delete(id: number) {
    await this.prisma.bookmark.delete({
      where: {
        id,
      },
    });

    return 'Delete success';
  }
}
