import { Injectable } from '@nestjs/common';
import { PasswordReset } from '@prisma/client';
import { PrismaService } from '@database/prisma/prisma.service';

@Injectable()
export class PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<PasswordReset> {
    return this.prisma.passwordReset.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    return this.prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
