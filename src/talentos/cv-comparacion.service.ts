import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import type { CvExtraido } from './cv-extraction.service';

const ComparacionCvSchema = z.object({
  puntajeAjuste: z.number().min(0).max(100),
  resumen: z.string(),
  fortalezas: z.array(z.string()),
  brechas: z.array(z.string()),
  otrosRolesSugeridos: z.array(z.string()),
});

export type ComparacionCv = z.infer<typeof ComparacionCvSchema>;

const PROMPT_BASE = `Eres un reclutador senior de RRHH. Compara el CV ya extraído de un talento contra la descripción de un puesto (puede ser el puesto actual de la persona u otro dentro de la empresa) y evalúa qué tan bien encaja.

Instrucciones:
- puntajeAjuste: 0-100, qué tan bien encaja el perfil con la descripción del puesto.
- resumen: 2-3 frases en español dominicano con la conclusión general.
- fortalezas: 2-4 puntos concretos del CV que respaldan el ajuste.
- brechas: 2-4 puntos concretos donde el CV no cubre lo que pide la descripción (arreglo vacío si no hay brechas relevantes).
- otrosRolesSugeridos: 0-3 otros roles dentro de una empresa a los que esta persona podría aplicar en el futuro, según su experiencia y habilidades (no repitas el puesto evaluado).

No inventes datos que no estén en el CV.

Descripción del puesto:
`;

@Injectable()
export class CvComparacionService {
  private readonly logger = new Logger(CvComparacionService.name);
  private readonly client = new Anthropic();

  /** Devuelve null si la IA no está disponible o falla — nunca lanza. */
  async comparar(
    descripcionPuesto: string,
    cv: CvExtraido,
  ): Promise<ComparacionCv | null> {
    try {
      const response = await this.client.messages.parse({
        model: 'claude-opus-4-8',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content:
              PROMPT_BASE +
              descripcionPuesto +
              '\n\nCV del talento (JSON):\n' +
              JSON.stringify(cv, null, 2),
          },
        ],
        output_config: { format: zodOutputFormat(ComparacionCvSchema) },
      });
      return response.parsed_output;
    } catch (err) {
      this.logger.warn(`No se pudo comparar el CV contra el puesto: ${err}`);
      return null;
    }
  }
}
