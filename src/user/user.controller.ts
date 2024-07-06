import {
  Body,
  Controller,
  Delete,
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
import { AuthGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(AuthGuard)
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
  async getUsers(
    @Ip() ip: string,
    // @Next() next: NextFunction,
    @HostParam() hosts: any,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request & TokenUser,
    @GetUser('id', ParseIntPipe) id: number,
  ) {
    // next();
    // console.log(ip, hosts, userAgent, req.user);
    return this.userService.getUsers(id);
  }

  @Get(':id')
  // @Header('Cache-Control', 'none') // response header
  // @Redirect('localhost:4000/api/v1/users', 302)
  getUser(
    @Param('id', ParseIntPipe) id: number,
    // @Query('version') version: string,
  ) {
    // console.log(version, id);
    return this.userService.getUser(id);
  }

  // @Controller({ host: ':acount.example.com' })
  // @Get('')
  // getInfo(@HostParam('acount') account: string) {
  //   console.log(account);
  //   return account;
  // }

  @Patch(':id')
  update(@Param() params: any, @Param('id') id: string, @Body() dto: UserDto) {
    // console.log(params.id, id, dto);
    return this.userService.update();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    // console.log(id);
    return this.userService.delete();
  }
}
