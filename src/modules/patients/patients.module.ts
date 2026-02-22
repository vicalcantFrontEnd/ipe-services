import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';

@Module({
  providers: [PatientsService, PatientsRepository],
  exports: [PatientsService],
})
export class PatientsModule {}
