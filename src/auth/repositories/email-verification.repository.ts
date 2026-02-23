import { Injectable } from '@nestjs/common';
import { EmailVerification } from '@prisma/client';
import { PrismaService } from '@database/prisma/prisma.service';

@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<EmailVerification> {
    return this.prisma.emailVerification.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
    return this.prisma.emailVerification.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.emailVerification.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
