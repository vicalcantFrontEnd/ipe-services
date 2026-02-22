import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsRepository } from './appointments.repository';

@Module({
  providers: [AppointmentsService, AppointmentsRepository],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
