import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    const authHeaders = req.headers.authorization;
    if (!authHeaders || typeof authHeaders !== 'string') {
      throw new UnauthorizedException('No authorization header');
    }
    if (!authHeaders.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    const token = authHeaders.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const jwtSecret = this.configService.get<string>('SECRET_ACCESS_KEY');

    if (!jwtSecret) {
      throw new UnauthorizedException('JWT secret is not configured');
    }
    try {
      const payload = jwt.verify(token, jwtSecret) as {
        sub: string;
        email: string;
        iat?: number;
        exp?: number;
      };
      req.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}