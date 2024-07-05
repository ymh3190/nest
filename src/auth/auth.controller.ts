import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Request, Response } from 'express';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(201)
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(200)
  @Post('signin')
  signin(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AuthDto,
  ) {
    return this.authService.signin(req, res, dto);
  }
}
