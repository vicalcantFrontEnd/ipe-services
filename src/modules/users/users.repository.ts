import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { QueryUserDto } from './dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findPaginated(query: QueryUserDto): Promise<PaginatedResponse<User>> {
    const { cursor, limit, role, status, search } = query;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      // Exclude STUDENT role — students are managed separately
      role: role
        ? { equals: role as Prisma.EnumUserRoleFilter['equals'] }
        : { not: 'STUDENT' },
      ...(status && { status: status as Prisma.EnumUserStatusFilter['equals'] }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const items = await this.prisma.user.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;

    return {
      data,
      meta: {
        cursor: data[data.length - 1]?.id ?? null,
        hasMore,
      },
    };
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where: { ...where, deletedAt: null } });
  }
}
