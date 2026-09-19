import { Controller, Post, Body, HttpCode, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GeneradorService } from './generador.service';
import { Public, RawResponse, RequestTimeout } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import {
  LeccionRequestSchema,
  ProfundizarRequestSchema,
  ModuloAcademicoRequestSchema,
  SpecUxRequestSchema,
  BorradorGuardarRequestSchema,
  BorradorCargarRequestSchema,
  type LeccionRequest,
  type ProfundizarRequest,
  type ModuloAcademicoRequest,
  type SpecUxRequest,
  type BorradorGuardarRequest,
  type BorradorCargarRequest,
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
@RequestTimeout(300_000) // 5 min: una generación con búsqueda web puede tardar ~2-3 min
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

  @Post('modulo-academico')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  async moduloAcademico(@Body(new ZodValidationPipe(ModuloAcademicoRequestSchema)) body: ModuloAcademicoRequest) {
    return this.service.generarModuloAcademico(body);
  }

  @Post('spec-ux')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  async specUx(@Body(new ZodValidationPipe(SpecUxRequestSchema)) body: SpecUxRequest) {
    return this.service.generarSpecUx(body);
  }

  // ── Persistencia de borradores (autosave del taller) ──────────────────────
  // Ops rápidas de DB: sobrescriben el timeout de 5 min del controlador con 15 s.

  @Post('borrador/guardar')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.OK)
  @RequestTimeout(15_000)
  @Throttle({ default: { limit: 120, ttl: 60_000 } }) // autosave con debounce
  async guardarBorrador(@Body(new ZodValidationPipe(BorradorGuardarRequestSchema)) body: BorradorGuardarRequest) {
    return this.service.guardarBorrador(body);
  }

  @Post('borrador/cargar')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.OK)
  @RequestTimeout(15_000)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async cargarBorrador(@Body(new ZodValidationPipe(BorradorCargarRequestSchema)) body: BorradorCargarRequest) {
    return this.service.cargarBorrador(body);
  }
}
