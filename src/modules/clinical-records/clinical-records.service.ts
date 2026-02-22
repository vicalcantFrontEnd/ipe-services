import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClinicalRecordsRepository } from './clinical-records.repository';

@Injectable()
export class ClinicalRecordsService {
  constructor(
    private readonly repo: ClinicalRecordsRepository,
    private readonly events: EventEmitter2,
  ) {}
}
