import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['bookit-access-token'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('SECRET_ACCESS_KEY'), 
    });
  }

  async validate(payload: any) {
    console.log('DECODED PAYLOAD:', payload);
    return { userId: payload.sub, email: payload.email };
  }
}

//this file is specifying where backend should be looking for jwt tokens