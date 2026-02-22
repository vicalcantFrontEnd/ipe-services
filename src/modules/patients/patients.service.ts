import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PatientsRepository } from './patients.repository';

@Injectable()
export class PatientsService {
  constructor(
    private readonly repo: PatientsRepository,
    private readonly events: EventEmitter2,
  ) {}
}
