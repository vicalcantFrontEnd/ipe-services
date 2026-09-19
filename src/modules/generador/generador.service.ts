import { Injectable } from '@nestjs/common';
import { AnthropicService } from './anthropic.service';
import { ENTREGAR_LECCION_TOOL, ENTREGAR_AMPLIACION_TOOL } from './llm/tools';
import { buildLeccionPrompt, buildProfundizarPrompt } from './llm/prompts';
import {
  DesarrolloSchema,
  AmpliacionSchema,
  type LeccionRequest,
  type ProfundizarRequest,
  type Desarrollo,
  type Ampliacion,
} from './schemas/generador.schemas';

@Injectable()
export class GeneradorService {
  constructor(private readonly anthropic: AnthropicService) {}

  /** Genera el desarrollo clínico completo de una lección. */
  async generarLeccion(input: LeccionRequest): Promise<Desarrollo> {
    return this.anthropic.generateStructured<Desarrollo>({
      userPrompt: buildLeccionPrompt(input),
      tool: ENTREGAR_LECCION_TOOL,
      investigar: input.investigar !== false,
      schema: DesarrolloSchema,
    });
  }

  /** Profundiza o corrige un punto concreto de una lección. */
  async profundizar(input: ProfundizarRequest): Promise<Ampliacion> {
    return this.anthropic.generateStructured<Ampliacion>({
      userPrompt: buildProfundizarPrompt(input),
      tool: ENTREGAR_AMPLIACION_TOOL,
      investigar: input.investigar !== false,
      schema: AmpliacionSchema,
    });
  }
}
