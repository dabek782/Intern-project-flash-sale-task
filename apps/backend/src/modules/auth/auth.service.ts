import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {PrismaClient, User} from '@prisma/client';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import bcrypt from 'bcrypt';
import { ACCESS_TOKEN_TTL_SECONDS } from './auth.constants';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../../shared/redis/redis.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(REDIS_CLIENT) private redisClient: RedisClientType,
  ) {}

  async register(userData: RegisterUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log('user Data:', userData);
    return this.prisma.user.create({
      data: { email: userData.email, firstName: userData.firstName, lastName: userData.lastName, password: hashedPassword, status: userData.status, createdBy: 'system', updatedBy: 'system' },
    });
  }

  async login(loginData: LoginUserDto): Promise<{ accessToken: string; user: User }> {
    const user = await this.validateUser(loginData.email, loginData.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const secret = this.configService.get<string>('SECRET_ACCESS_KEY');
    const refreshTokenSecret = this.configService.get<string>('SECRET_REFRESH_KEY');
    if (!secret || !refreshTokenSecret) {
      throw new Error('JWT secret or refresh token secret is not defined in the environment variables');
    }

    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email }, { secret , expiresIn: ACCESS_TOKEN_TTL_SECONDS });
    const refreshToken = await this.jwtService.signAsync({ sub: user.id, email: user.email }, { secret: refreshTokenSecret, expiresIn: '14d' });
    const sessionKey = this.getSessionKey(user.id);
    const sessionData = { userId: user.id, email: user.email, refreshToken };
    console.log('Session Key:', sessionKey , 'Session Data:', sessionData  ,'AccessToken:' , accessToken , 'RefreshToken:' , refreshToken);
    const sessionResult = await this.redisClient.setEx(
      sessionKey,
      1209600,
      sessionData ? JSON.stringify(sessionData) : '',

    );
    console.log('Session Result:', sessionResult);

    return { accessToken, user };
  }

  async logout(email: string): Promise<void> {
    console.log('Logging out user with email:', email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log('Found user:', user);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const sessionKey = this.getSessionKey(user.id);
    await this.redisClient.del(sessionKey);
  }
  async refreshToken(userId: string, refreshToken: string): Promise<{ accessToken: string }> {
    const sessionKey = this.getSessionKey(userId);
    const sessionDataString = await this.redisClient.get(sessionKey);

    if (!sessionDataString) {
      throw new UnauthorizedException('Session not found');
    }

    const sessionData = JSON.parse(sessionDataString);

    if (sessionData.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const secret = this.configService.get<string>('SECRET_ACCESS_KEY');
    if (!secret) {
      throw new Error('JWT secret is not defined in the environment variables');
    }

    const accessToken = await this.jwtService.signAsync({ sub: userId, email: sessionData.email }, { secret , expiresIn: ACCESS_TOKEN_TTL_SECONDS });
    const refreshTokenSecret = this.configService.get<string>('SECRET_REFRESH_KEY');
    if (!refreshTokenSecret) {
      throw new Error('Refresh token secret is not defined in the environment variables');
    }

    const newRefreshToken = await this.jwtService.signAsync({ sub: userId, email: sessionData.email }, { secret: refreshTokenSecret, expiresIn: '14d' });
    const newSessionData = { ...sessionData, newRefreshToken };
    await this.redisClient.setEx(sessionKey, 1209600, JSON.stringify(newSessionData));

    return { accessToken };
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private getSessionKey(userId: string): string {
    return `auth:session:${userId}`;
  }
}
