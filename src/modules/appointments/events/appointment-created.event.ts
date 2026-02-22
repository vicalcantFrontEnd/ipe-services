export class AppointmentCreatedEvent {
  constructor(
    public readonly appointmentId: string,
    public readonly patientId: string,
    public readonly psychologistId: string,
    public readonly scheduledAt: Date,
  ) {}
}
