export class AppointmentCancelledEvent {
  constructor(
    public readonly appointmentId: string,
    public readonly patientId: string,
    public readonly reason: string,
  ) {}
}
