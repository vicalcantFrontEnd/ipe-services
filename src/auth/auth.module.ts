import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../modules/users/users.module';
import { RedisModule } from '../database/redis/redis.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { PasswordResetRepository } from './repositories/password-reset.repository';
import { EmailVerificationRepository } from './repositories/email-verification.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    UsersModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    AuthService,
    TokenBlacklistService,
    PasswordResetRepository,
    EmailVerificationRepository,
  ],
  exports: [JwtAuthGuard, TokenBlacklistService],
})
export class AuthModule {}
