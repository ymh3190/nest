import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    // const user = await this.prisma.user.findUnique({
    //   where: {
    //     id,
    //   },
    // });
    // if (user.role !== 'admin') {
    //   throw new ForbiddenException('Unauthorized to access this route');
    // }
    const users = await this.prisma.user.findMany();
    return users;
  }

  async getUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  update() {
    return 'updated user';
  }

  delete() {
    return;
  }
}
