import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnrollmentsRepository } from './enrollments.repository';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly repo: EnrollmentsRepository,
    private readonly events: EventEmitter2,
  ) {}
}
