import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Diplomado } from '@prisma/client';
import { DiplomadosRepository } from './diplomados.repository';
import { CreateDiplomadoDto, UpdateDiplomadoDto, QueryDiplomadoDto } from './dto';
import { ResourceNotFoundException, DuplicateResourceException } from '../../common/exceptions';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class DiplomadosService {
  constructor(
    private readonly repo: DiplomadosRepository,
    private readonly events: EventEmitter2,
  ) {}

  async create(dto: CreateDiplomadoDto): Promise<Diplomado> {
    const slug = this.generateSlug(dto.name);

    const existingSlug = await this.repo.findBySlug(slug);
    if (existingSlug) {
      throw new DuplicateResourceException('Diplomado', 'name');
    }

    const diplomado = await this.repo.create({
      name: dto.name,
      slug,
      description: dto.description,
      ...(dto.teacherId && { teacher: { connect: { id: dto.teacherId } } }),
      status: dto.status ?? 'DRAFT',
      modality: dto.modality,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      durationHours: dto.durationHours,
      capacity: dto.capacity,
      price: dto.price,
      currency: dto.currency,
      imageUrl: dto.imageUrl,
    });

    this.events.emit('diplomado.created', { diplomadoId: diplomado.id, name: diplomado.name });

    return diplomado;
  }

  async findById(id: string): Promise<Diplomado> {
    const diplomado = await this.repo.findById(id);
    if (!diplomado) throw new ResourceNotFoundException('Diplomado', id);
    return diplomado;
  }

  async findBySlug(slug: string): Promise<Diplomado> {
    const diplomado = await this.repo.findBySlug(slug);
    if (!diplomado) throw new ResourceNotFoundException('Diplomado', slug);
    return diplomado;
  }

  async findAll(query: QueryDiplomadoDto): Promise<PaginatedResponse<Diplomado>> {
    return this.repo.findPaginated(query);
  }

  async update(id: string, dto: UpdateDiplomadoDto): Promise<Diplomado> {
    await this.findById(id);

    const updateData: Record<string, unknown> = { ...dto };

    // Regenerate slug if name changed
    if (dto.name) {
      const newSlug = this.generateSlug(dto.name);
      const existing = await this.repo.findBySlug(newSlug);
      if (existing && existing.id !== id) {
        throw new DuplicateResourceException('Diplomado', 'name');
      }
      updateData.slug = newSlug;
    }

    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    if (dto.teacherId) {
      updateData.teacher = { connect: { id: dto.teacherId } };
      delete updateData.teacherId;
    }

    return this.repo.update(id, updateData);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.softDelete(id);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
