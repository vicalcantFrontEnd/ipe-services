import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppointmentCreatedEvent } from '../../appointments/events/appointment-created.event';
import { AppointmentCancelledEvent } from '../../appointments/events/appointment-cancelled.event';

@Injectable()
export class AppointmentNotificationListener {
  private readonly logger = new Logger(AppointmentNotificationListener.name);

  @OnEvent('appointment.created', { async: true })
  async handleAppointmentCreated(event: AppointmentCreatedEvent): Promise<void> {
    this.logger.log(`New appointment ${event.appointmentId} scheduled for ${event.scheduledAt.toISOString()}`);
    // TODO: Send notification to patient and psychologist
  }

  @OnEvent('appointment.cancelled', { async: true })
  async handleAppointmentCancelled(event: AppointmentCancelledEvent): Promise<void> {
    this.logger.log(`Appointment ${event.appointmentId} cancelled: ${event.reason}`);
    // TODO: Send cancellation notification
  }
}
