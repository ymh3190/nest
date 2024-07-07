import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { LoggerMiddlware } from './middleware';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    AuthModule,
    UserModule,
    PrismaModule,
  ],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddlware).forRoutes('api/v1/users');
    consumer
      .apply(LoggerMiddlware)
      // .forRoutes({ path: '*', method: RequestMethod.ALL })
      .forRoutes({ path: 'api/v1/users', method: RequestMethod.GET });
  }
}
