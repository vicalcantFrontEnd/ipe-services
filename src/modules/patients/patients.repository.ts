import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class PatientsRepository {
  constructor(private readonly prisma: PrismaService) {}
}
