import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guard';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './guard/role.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    AuthService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
