import { Module } from '@nestjs/common';
import { ClinicalRecordsService } from './clinical-records.service';
import { ClinicalRecordsRepository } from './clinical-records.repository';

@Module({
  providers: [ClinicalRecordsService, ClinicalRecordsRepository],
  exports: [ClinicalRecordsService],
})
export class ClinicalRecordsModule {}
