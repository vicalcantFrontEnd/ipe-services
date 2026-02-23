import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import type { StringValue } from 'ms';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import * as argon2 from 'argon2';
import { UsersRepository } from '../modules/users/users.repository';
import { PasswordResetRepository } from './repositories/password-reset.repository';
import { EmailVerificationRepository } from './repositories/email-verification.repository';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto';
import { BusinessException, DuplicateResourceException, ErrorCodes } from '../common/exceptions';
import { TokenBlacklistService } from './services/token-blacklist.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface AuthResponse {
  user: SafeUser;
  tokens: TokenPair;
}

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly usersRepo: UsersRepository,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly passwordResetRepo: PasswordResetRepository,
    private readonly emailVerificationRepo: EmailVerificationRepository,
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

    await this.createEmailVerification(user.id, user.email);

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

  async logout(accessToken: string): Promise<void> {
    const decoded = this.jwt.decode(accessToken) as { exp?: number } | null;
    if (!decoded?.exp) return;

    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;
    if (ttl <= 0) return;

    await this.tokenBlacklist.blacklistToken(accessToken, ttl);
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

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BusinessException(
        ErrorCodes.V_INVALID_INPUT,
        'La nueva contraseña y la confirmación no coinciden',
      );
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BusinessException(
        ErrorCodes.V_INVALID_INPUT,
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const newHash = await argon2.hash(dto.newPassword);
    await this.usersRepo.updatePassword(userId, newHash);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) return; // Don't reveal if email exists

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

    await this.passwordResetRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // TODO: Send password reset email with rawToken
    // In production, integrate with a mailer service (e.g., @nestjs-modules/mailer)
    if (this.config.get<string>('app.NODE_ENV') === 'development') {
      this.logger.debug(`[DEV ONLY] Password reset token for ${user.email}: ${rawToken}`);
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmNewPassword) {
      throw new BusinessException(
        ErrorCodes.V_INVALID_INPUT,
        'La nueva contraseña y la confirmación no coinciden',
      );
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const resetRecord = await this.passwordResetRepo.findByTokenHash(tokenHash);

    if (!resetRecord) {
      throw new BusinessException(
        ErrorCodes.A_TOKEN_EXPIRED,
        'Token inválido o expirado',
      );
    }

    const newHash = await argon2.hash(newPassword);
    await this.usersRepo.updatePassword(resetRecord.userId, newHash);
    await this.passwordResetRepo.markUsed(resetRecord.id);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const record = await this.emailVerificationRepo.findByTokenHash(tokenHash);

    if (!record) {
      throw new BusinessException(
        ErrorCodes.A_TOKEN_EXPIRED,
        'Token inválido o expirado',
      );
    }

    await this.usersRepo.update(record.userId, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
    await this.emailVerificationRepo.markUsed(record.id);
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) return; // Don't reveal if email exists

    if (user.emailVerified) return; // Don't reveal verification status

    await this.createEmailVerification(user.id, user.email);
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return this.stripHash(user);
  }

  private async createEmailVerification(userId: string, email: string): Promise<void> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

    await this.emailVerificationRepo.create({
      userId,
      tokenHash,
      expiresAt,
    });

    // TODO: Send verification email with rawToken
    // In production, integrate with a mailer service (e.g., @nestjs-modules/mailer)
    if (this.config.get<string>('app.NODE_ENV') === 'development') {
      this.logger.debug(`[DEV ONLY] Email verification token for ${email}: ${rawToken}`);
    }
  }

  private async generateTokenPair(userId: string, email: string, role: string): Promise<TokenPair> {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email, role, jti: accessJti },
        {
          secret: this.config.getOrThrow<string>('auth.JWT_ACCESS_SECRET'),
          expiresIn: this.config.getOrThrow('auth.JWT_ACCESS_EXPIRATION') as StringValue,
        },
      ),
      this.jwt.signAsync(
        { sub: userId, email, role, jti: refreshJti },
        {
          secret: this.config.getOrThrow<string>('auth.JWT_REFRESH_SECRET'),
          expiresIn: this.config.getOrThrow('auth.JWT_REFRESH_EXPIRATION') as StringValue,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private stripHash(user: User): SafeUser {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
