import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentsRepository } from './appointments.repository';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly repo: AppointmentsRepository,
    private readonly events: EventEmitter2,
  ) {}
}
