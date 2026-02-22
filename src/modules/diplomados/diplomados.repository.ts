import { Injectable } from '@nestjs/common';
import { Prisma, Diplomado } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { QueryDiplomadoDto } from './dto';

@Injectable()
export class DiplomadosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DiplomadoCreateInput): Promise<Diplomado> {
    return this.prisma.diplomado.create({ data });
  }

  async findById(id: string): Promise<Diplomado | null> {
    return this.prisma.diplomado.findFirst({
      where: { id, deletedAt: null },
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findBySlug(slug: string): Promise<Diplomado | null> {
    return this.prisma.diplomado.findFirst({
      where: { slug, deletedAt: null },
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findPaginated(query: QueryDiplomadoDto): Promise<PaginatedResponse<Diplomado>> {
    const { cursor, limit, status, modality, search } = query;

    const where: Prisma.DiplomadoWhereInput = {
      deletedAt: null,
      ...(status && { status: status as Prisma.EnumDiplomadoStatusFilter['equals'] }),
      ...(modality && { modality: modality as Prisma.EnumModalityFilter['equals'] }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const items = await this.prisma.diplomado.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
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

  async update(id: string, data: Prisma.DiplomadoUpdateInput): Promise<Diplomado> {
    return this.prisma.diplomado.update({
      where: { id },
      data,
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.diplomado.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(where?: Prisma.DiplomadoWhereInput): Promise<number> {
    return this.prisma.diplomado.count({ where: { ...where, deletedAt: null } });
  }
}
