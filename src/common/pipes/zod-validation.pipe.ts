import { PipeTransform } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { PlainErrorException } from '../exceptions';

/**
 * Valida el cuerpo de la petición contra un esquema zod. En caso de error
 * lanza `PlainErrorException` para que el cliente reciba `{ error }` con un
 * mensaje legible (contrato del Generador de Diplomados).
 *
 * Uso: `@Body(new ZodValidationPipe(MiSchema)) dto: MiTipo`.
 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new PlainErrorException(this.formatError(result.error));
    }
    return result.data;
  }

  private formatError(error: ZodError): string {
    const first = error.errors[0];
    if (!first) return 'Datos de entrada inválidos.';
    const path = first.path.join('.');
    return path ? `Campo '${path}': ${first.message}` : first.message;
  }
}
