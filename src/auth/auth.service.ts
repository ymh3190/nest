import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { Role } from './enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const { email, password } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const users = await this.prisma.user.findMany();
    const role = users.length === 0 ? Role.Admin : Role.User;

    const hash = await argon.hash(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        role,
      },
    });
    return user;
  }

  async signin(req: Request, res: Response, dto: AuthDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCorrectPassword = await argon.verify(user.password, password);
    if (!isCorrectPassword) {
      throw new BadRequestException('Password not match');
    }

    const tokenUser: {
      user: { userId: number; email: string };
      refreshToken?: string;
    } = {
      user: { userId: user.id, email: user.email },
    };

    let refreshToken = '';
    const existingToken = await this.prisma.token.findUnique({
      where: {
        userId: user.id,
      },
    });
    if (existingToken) {
      const { isValid } = existingToken;
      if (!isValid) {
        throw new ForbiddenException('Credentials invalid');
      }
      tokenUser.refreshToken = existingToken.refreshToken;

      const accessJwt = await this.jwtService.signAsync(tokenUser, {
        expiresIn: '1d',
        secret: this.config.get('JWT_SECRET'),
      });
      const refreshJwt = await this.jwtService.signAsync(tokenUser, {
        expiresIn: '30d',
        secret: this.config.get('JWT_SECRET'),
      });
      res.cookie('accessToken', accessJwt, {
        httpOnly: true,
        secure: false,
        signed: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      res.cookie('refreshToken', refreshJwt, {
        httpOnly: true,
        secure: false,
        signed: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
      return tokenUser;
    }

    const accessJwt = await this.jwtService.signAsync(tokenUser, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });

    refreshToken = randomBytes(40).toString('hex');
    tokenUser.refreshToken = refreshToken;
    const refreshJwt = await this.jwtService.signAsync(tokenUser, {
      expiresIn: '30d',
      secret: this.config.get('JWT_SECRET'),
    });

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const userToken = { ip, userAgent, refreshToken, userId: user.id };
    await this.prisma.token.create({
      data: {
        ...userToken,
      },
    });

    res.cookie('accessToken', accessJwt, {
      httpOnly: true,
      secure: false,
      signed: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    res.cookie('refreshToken', refreshJwt, {
      httpOnly: true,
      secure: false,
      signed: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
    return tokenUser;
  }
}
