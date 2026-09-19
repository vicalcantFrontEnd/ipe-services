import { Controller, Post, Body, HttpCode, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GeneradorService } from './generador.service';
import { Public, RawResponse, RequestTimeout } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import {
  LeccionRequestSchema,
  ProfundizarRequestSchema,
  type LeccionRequest,
  type ProfundizarRequest,
} from './schemas/generador.schemas';

/**
 * Generador de Diplomados (TCC). Endpoints self-service consumidos por el
 * frontend `/generador-diplomados`. Contrato fijado por el handoff:
 *  - Rutas sin versión: `/api/generador/*`.
 *  - Respuesta 200 con el JSON crudo (sin envelope de la casa) → @RawResponse.
 *  - Errores con status ≠ 2xx y cuerpo `{ error }` → PlainErrorException.
 *  - Públicos (el frontend no envía JWT); rate limit estricto por coste del LLM.
 */
@ApiTags('generador')
@RequestTimeout(180_000) // 3 min: una generación con búsqueda web puede tardar 20–60s+
@Controller({ path: 'generador', version: VERSION_NEUTRAL })
export class GeneradorController {
  constructor(private readonly service: GeneradorService) {}

  @Post('leccion')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async leccion(@Body(new ZodValidationPipe(LeccionRequestSchema)) body: LeccionRequest) {
    return this.service.generarLeccion(body);
  }

  @Post('profundizar')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async profundizar(@Body(new ZodValidationPipe(ProfundizarRequestSchema)) body: ProfundizarRequest) {
    return this.service.profundizar(body);
  }
}
