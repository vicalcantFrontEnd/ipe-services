import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import type { StringValue } from 'ms';
import * as argon2 from 'argon2';
import { UsersRepository } from '../modules/users/users.repository';
import { LoginDto, RegisterDto } from './dto';
import { DuplicateResourceException } from '../common/exceptions';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface AuthResponse {
  user: SafeUser;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly usersRepo: UsersRepository,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) {
      throw new DuplicateResourceException('User', 'email');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.usersRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
    });

    const tokens = await this.generateTokenPair(user.id, user.email, user.role);
    return { user: this.stripHash(user), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const tokens = await this.generateTokenPair(user.id, user.email, user.role);
    return { user: this.stripHash(user), tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('auth.JWT_REFRESH_SECRET'),
      });

      const user = await this.usersRepo.findById(payload.sub);
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Token inválido');
      }

      return this.generateTokenPair(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return this.stripHash(user);
  }

  private async generateTokenPair(userId: string, email: string, role: string): Promise<TokenPair> {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('auth.JWT_ACCESS_SECRET'),
        expiresIn: this.config.getOrThrow('auth.JWT_ACCESS_EXPIRATION') as StringValue,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('auth.JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow('auth.JWT_REFRESH_EXPIRATION') as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private stripHash(user: User): SafeUser {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
