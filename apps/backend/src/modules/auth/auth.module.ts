import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../../shared/redis/redis.module';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ACCESS_TOKEN_TTL_SECONDS } from './auth.constants';
import { ConfigModule,  } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import {JwtAuthGuard} from '../../common/auth-guard';
import { JwtStrategy } from '../../common/jwt-strategy';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    }),
  ],
  providers: [AuthService ,JwtAuthGuard , JwtStrategy ],
  controllers: [AuthController],
})

export class AuthModule {}
