import { SetMetadata } from '@nestjs/common';

/**
 * Marca un handler para que su respuesta NO se envuelva en el envelope
 * estándar `{ success, data }` del TransformInterceptor. El cuerpo del
 * handler se devuelve tal cual (JSON crudo).
 *
 * Se usa en endpoints cuyo contrato lo fija un consumidor externo (p. ej. el
 * frontend del Generador de Diplomados, que espera el objeto `Desarrollo` plano).
 */
export const RAW_RESPONSE_KEY = 'rawResponse';
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
