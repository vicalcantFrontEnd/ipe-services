import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}
}
