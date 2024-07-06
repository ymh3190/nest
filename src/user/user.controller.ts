import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  Headers,
  HostParam,
  HttpCode,
  HttpStatus,
  Ip,
  Next,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { NextFunction, Request, Response } from 'express';
import { UserDto } from './dto';
import { TokenUser, User } from './interfaces';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { GetUser, Roles } from 'src/auth/decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('api/v1/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: Request & TokenUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(req.user);
    return;
  }

  @Get('')
  @Roles(['admin'])
  async getUsers(
    @Ip() ip: string,
    // @Next() next: NextFunction,
    @HostParam() hosts: any,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request & TokenUser,
    @GetUser('id', ParseIntPipe) id: number,
  ) {
    console.log(req.user);
    // next();
    // console.log(ip, hosts, userAgent, req.user);
    return this.userService.getUsers();
  }

  @Get(':id')
  // @Header('Cache-Control', 'none') // response header
  // @Redirect('localhost:4000/api/v1/users', 302)
  @Roles(['admin', 'user'])
  getUser(
    @GetUser() user: { id: number; email: string; role: 'admin' | 'user' },
    @Param('id', ParseIntPipe) id: number,
    // @Query('version') version: string,
  ) {
    // if admin, pass
    // if user, check user id == id
    // check permission
    // console.log(version, id);
    if (user.role === 'user' && user.id !== id) {
      throw new ForbiddenException('Invalid Authentication');
    }
    return this.userService.getUser(id);
  }

  // @Controller({ host: ':acount.example.com' })
  // @Get('')
  // getInfo(@HostParam('acount') account: string) {
  //   console.log(account);
  //   return account;
  // }

  @Patch(':id')
  @Roles(['admin', 'user'])
  update(@Param() params: any, @Param('id') id: string, @Body() dto: UserDto) {
    // console.log(params.id, id, dto);
    return this.userService.update();
  }

  @Delete(':id')
  @Roles(['admin', 'user'])
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    // console.log(id);
    return this.userService.delete();
  }
}
