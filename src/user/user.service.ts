import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    // check role == admin
    const users = await this.prisma.user.findMany();
    return users;
  }

  async getUser(id: number) {
    // access user != request id
    // throw error

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, dto: UserDto) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: { ...dto },
    });
    return user;
  }

  async delete(id: number) {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return 'Delete success';
  }
}
