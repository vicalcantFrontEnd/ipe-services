import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AnthropicService } from './anthropic.service';
import { ENTREGAR_LECCION_TOOL, ENTREGAR_AMPLIACION_TOOL, ENTREGAR_MODULO_TOOL, ENTREGAR_UX_TOOL } from './llm/tools';
import {
  buildLeccionPrompt,
  buildProfundizarPrompt,
  buildModuloAcademicoPrompt,
  buildSpecUxPrompt,
} from './llm/prompts';
import { buildClinicoSystemPrompt, buildInstruccionalSystemPrompt, buildUxSystemPrompt } from './llm/system-prompt';
import {
  DesarrolloSchema,
  AmpliacionSchema,
  ModuloAcademicoSchema,
  SpecUxSchema,
  type LeccionRequest,
  type ProfundizarRequest,
  type ModuloAcademicoRequest,
  type SpecUxRequest,
  type Desarrollo,
  type Ampliacion,
  type ModuloAcademico,
  type SpecUx,
  type BorradorData,
  type BorradorGuardarRequest,
  type BorradorCargarRequest,
} from './schemas/generador.schemas';

@Injectable()
export class GeneradorService implements OnModuleInit {
  private readonly logger = new Logger(GeneradorService.name);

  constructor(
    private readonly anthropic: AnthropicService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Precarga (y verifica) las skills de los 3 agentes al arrancar. Si algún .md
   * no llegó a la imagen, `readSkill` deja un warning y se usa el fallback.
   */
  onModuleInit(): void {
    const clinico = buildClinicoSystemPrompt().length;
    const instruccional = buildInstruccionalSystemPrompt().length;
    const ux = buildUxSystemPrompt().length;
    this.logger.log(
      `Skills de agentes cargadas → clínico=${clinico} · instruccional=${instruccional} · ux=${ux} caracteres`,
    );
  }

  /** Genera el desarrollo clínico completo de una lección. */
  async generarLeccion(input: LeccionRequest): Promise<Desarrollo> {
    return this.anthropic.generateStructured<Desarrollo>({
      system: buildClinicoSystemPrompt(),
      userPrompt: buildLeccionPrompt(input),
      tool: ENTREGAR_LECCION_TOOL,
      investigar: input.investigar !== false,
      schema: DesarrolloSchema,
    });
  }

  /** Profundiza o corrige un punto concreto de una lección. */
  async profundizar(input: ProfundizarRequest): Promise<Ampliacion> {
    return this.anthropic.generateStructured<Ampliacion>({
      system: buildClinicoSystemPrompt(),
      userPrompt: buildProfundizarPrompt(input),
      tool: ENTREGAR_AMPLIACION_TOOL,
      investigar: input.investigar !== false,
      schema: AmpliacionSchema,
    });
  }

  /** Agente 2 — genera la capa académica de un módulo (Bloom, actividad, reactivos). */
  async generarModuloAcademico(input: ModuloAcademicoRequest): Promise<ModuloAcademico> {
    return this.anthropic.generateStructured<ModuloAcademico>({
      system: buildInstruccionalSystemPrompt(),
      userPrompt: buildModuloAcademicoPrompt(input),
      tool: ENTREGAR_MODULO_TOOL,
      investigar: input.investigar === true, // por defecto sin web search (más barato)
      schema: ModuloAcademicoSchema,
    });
  }

  /** Agente 3 — genera la especificación de diseño UX del módulo. */
  async generarSpecUx(input: SpecUxRequest): Promise<SpecUx> {
    return this.anthropic.generateStructured<SpecUx>({
      system: buildUxSystemPrompt(),
      userPrompt: buildSpecUxPrompt(input),
      tool: ENTREGAR_UX_TOOL,
      investigar: input.investigar === true, // por defecto sin web search
      schema: SpecUxSchema,
    });
  }

  // ── Persistencia de borradores (autosave del taller) ───────────────────────

  /**
   * Guarda (upsert idempotente por `docId`) el borrador del diplomado. El
   * frontend hace autosave con debounce, así que basta sobrescribir `data`.
   * Devuelve `{}` (el frontend solo comprueba el 200).
   */
  async guardarBorrador(input: BorradorGuardarRequest): Promise<Record<string, never>> {
    const data = input.data as Prisma.InputJsonValue;
    await this.prisma.generadorBorrador.upsert({
      where: { docId: input.docId },
      create: { docId: input.docId, data },
      update: { data },
    });
    return {};
  }

  /** Carga el borrador por `docId`; `null` si aún no hay ninguno guardado. */
  async cargarBorrador(input: BorradorCargarRequest): Promise<BorradorData | null> {
    const row = await this.prisma.generadorBorrador.findUnique({
      where: { docId: input.docId },
    });
    return (row?.data as BorradorData | undefined) ?? null;
  }
}
