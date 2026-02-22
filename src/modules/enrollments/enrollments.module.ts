import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsRepository } from './enrollments.repository';

@Module({
  providers: [EnrollmentsService, EnrollmentsRepository],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
