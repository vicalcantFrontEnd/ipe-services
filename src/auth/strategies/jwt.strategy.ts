import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { TokenBlacklistService } from '../services/token-blacklist.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('auth.JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: FastifyRequest, payload: JwtPayload): Promise<{ id: string; email: string; role: string }> {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token revocado');
      }
    }

    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
