import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('SkillLoader');

// En runtime este archivo vive en dist/modules/generador/llm/, y los .md se
// copian ahí vía nest-cli assets (ver nest-cli.json).
const SKILLS_DIR = join(__dirname, 'skills');

/**
 * Lee una skill completa (SKILL.md + todos los references/*.md) y devuelve su
 * contenido concatenado, listo para inyectar como material de referencia en el
 * system prompt. Se elimina el frontmatter YAML del SKILL.md.
 *
 * Si no encuentra los archivos (p. ej. no se copiaron a dist), devuelve cadena
 * vacía y registra un warning; el llamador usa un fallback con las salvaguardas
 * mínimas embebidas.
 */
export function readSkill(skillName: string): string {
  try {
    const base = join(SKILLS_DIR, skillName);
    const parts: string[] = [];

    const skillMd = join(base, 'SKILL.md');
    if (existsSync(skillMd)) {
      parts.push(stripFrontmatter(readFileSync(skillMd, 'utf8')));
    }

    const refDir = join(base, 'references');
    if (existsSync(refDir)) {
      const files = readdirSync(refDir)
        .filter((f) => f.endsWith('.md'))
        .sort();
      for (const f of files) {
        parts.push(`\n\n--- references/${f} ---\n\n${readFileSync(join(refDir, f), 'utf8')}`);
      }
    }

    if (parts.length === 0) {
      logger.warn(`Skill '${skillName}' no encontrada en ${base}. Se usará el fallback mínimo.`);
      return '';
    }

    const content = parts.join('\n');
    logger.log(`Skill '${skillName}' cargada (${content.length} caracteres).`);
    return content;
  } catch (err) {
    logger.error(`Error leyendo skill '${skillName}': ${(err as Error).message}`);
    return '';
  }
}

/** Elimina el bloque frontmatter YAML (--- ... ---) al inicio de un .md. */
function stripFrontmatter(md: string): string {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('\n---', 3);
  return end === -1 ? md : md.slice(md.indexOf('\n', end + 1) + 1).trimStart();
}
