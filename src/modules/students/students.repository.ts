import { Injectable } from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { QueryStudentDto } from './dto';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StudentCreateInput): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  async findById(id: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findByDocumentNumber(documentNumber: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: { documentNumber, deletedAt: null },
    });
  }

  async findPaginated(query: QueryStudentDto): Promise<PaginatedResponse<Student>> {
    const { cursor, limit, status, search, city } = query;

    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      ...(status && { status: status as Prisma.EnumUserStatusFilter['equals'] }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { documentNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const items = await this.prisma.student.findMany({
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

  async update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    return this.prisma.student.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(where?: Prisma.StudentWhereInput): Promise<number> {
    return this.prisma.student.count({ where: { ...where, deletedAt: null } });
  }
}
