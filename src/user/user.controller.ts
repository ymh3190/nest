import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto';
import { AuthGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { Role } from 'src/auth/enum';

@UseGuards(AuthGuard)
@Controller('api/v1/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @Roles(Role.Admin)
  getUsers() {
    return this.userService.getUsers();
  }

  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
