export class PaymentCompletedEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly patientId: string,
    public readonly amount: number,
  ) {}
}
