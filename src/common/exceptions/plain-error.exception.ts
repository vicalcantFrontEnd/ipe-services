import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción cuyo cuerpo de respuesta es exactamente `{ "error": "<mensaje>" }`,
 * con el status HTTP indicado. La reconoce `AllExceptionsFilter`, que la
 * serializa sin el envelope estándar de la casa.
 *
 * Pensada para endpoints cuyo contrato de error lo fija un consumidor externo
 * (p. ej. el frontend del Generador de Diplomados muestra `error` en un toast).
 */
export class PlainErrorException extends HttpException {
  constructor(message: string, statusCode: number = HttpStatus.BAD_REQUEST) {
    super({ error: message }, statusCode);
  }
}
