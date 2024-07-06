import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddlware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('hi i"m logger');
    next();
  }
}

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
}
