import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Student } from '@prisma/client';
import { StudentsRepository } from './students.repository';
import { CreateStudentDto, UpdateStudentDto, QueryStudentDto } from './dto';
import { ResourceNotFoundException, DuplicateResourceException } from '../../common/exceptions';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class StudentsService {
  constructor(
    private readonly repo: StudentsRepository,
    private readonly events: EventEmitter2,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    // Check email uniqueness
    const existingEmail = await this.repo.findByEmail(dto.email);
    if (existingEmail) {
      throw new DuplicateResourceException('Student', 'email');
    }

    // Check document number uniqueness
    const existingDoc = await this.repo.findByDocumentNumber(dto.documentNumber);
    if (existingDoc) {
      throw new DuplicateResourceException('Student', 'documentNumber');
    }

    const student = await this.repo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
      address: dto.address,
      city: dto.city,
    });

    this.events.emit('student.created', { studentId: student.id, email: student.email });

    return student;
  }

  async findById(id: string): Promise<Student> {
    const student = await this.repo.findById(id);
    if (!student) throw new ResourceNotFoundException('Student', id);
    return student;
  }

  async findAll(query: QueryStudentDto): Promise<PaginatedResponse<Student>> {
    return this.repo.findPaginated(query);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    await this.findById(id);

    if (dto.email) {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new DuplicateResourceException('Student', 'email');
      }
    }

    if (dto.documentNumber) {
      const existing = await this.repo.findByDocumentNumber(dto.documentNumber);
      if (existing && existing.id !== id) {
        throw new DuplicateResourceException('Student', 'documentNumber');
      }
    }

    return this.repo.update(id, {
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.softDelete(id);
  }
}
