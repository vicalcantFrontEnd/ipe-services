import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BillingRepository } from './billing.repository';

@Injectable()
export class BillingService {
  constructor(
    private readonly repo: BillingRepository,
    private readonly events: EventEmitter2,
  ) {}
}
