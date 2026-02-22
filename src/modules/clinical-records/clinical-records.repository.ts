import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class ClinicalRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}
}
