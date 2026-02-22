import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { UsersRepository } from './users.repository';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
import { ResourceNotFoundException, DuplicateResourceException } from '../../common/exceptions';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { UserCreatedEvent } from './events/user-created.event';

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly events: EventEmitter2,
  ) {}

  private stripHash(user: User): SafeUser {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new DuplicateResourceException('User', 'email');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.repo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      role: dto.role,
      avatarUrl: dto.avatarUrl,
    });

    this.events.emit('user.created', new UserCreatedEvent(user.id, user.email, user.role));

    return this.stripHash(user);
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.repo.findById(id);
    if (!user) throw new ResourceNotFoundException('User', id);
    return this.stripHash(user);
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResponse<SafeUser>> {
    const result = await this.repo.findPaginated(query);
    return {
      ...result,
      data: result.data.map((u) => this.stripHash(u)),
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.repo.findById(id);
    if (!user) throw new ResourceNotFoundException('User', id);

    if (dto.email) {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new DuplicateResourceException('User', 'email');
      }
    }

    const { password, ...updateData } = dto;
    const data: Record<string, unknown> = { ...updateData };
    if (password) {
      data.passwordHash = await argon2.hash(password);
    }

    const updated = await this.repo.update(id, data);
    return this.stripHash(updated);
  }

  async remove(id: string): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new ResourceNotFoundException('User', id);
    await this.repo.softDelete(id);
  }
}
