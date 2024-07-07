import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';

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

  async update(id: number, dto: UserDto) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
    return;
  }

  async delete(id: number) {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
    return;
  }
}
