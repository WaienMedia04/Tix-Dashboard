import { Injectable, Logger } from '@nestjs/common';
import type { Mistral } from '@mistralai/mistralai';
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

const MODELO = 'mistral-large-latest';

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
  private clientPromise: Promise<Mistral> | null = null;

  // @mistralai/mistralai v2 es ESM-only — ver la misma nota en
  // src/talentos/cv-extraction.service.ts.
  private async getClient(): Promise<Mistral> {
    if (!this.clientPromise) {
      this.clientPromise = import('@mistralai/mistralai').then(
        ({ Mistral: MistralClient }) =>
          new MistralClient({ apiKey: process.env.MISTRAL_API_KEY }),
      );
    }
    return this.clientPromise;
  }

  /** Devuelve null si la IA no está disponible o falla — nunca lanza. */
  async comparar(
    descripcionPuesto: string,
    cv: CvExtraido,
  ): Promise<ComparacionCv | null> {
    try {
      const client = await this.getClient();
      const response = await client.chat.parse({
        model: MODELO,
        maxTokens: 2048,
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
        responseFormat: ComparacionCvSchema,
      });
      const parsed = response.choices?.[0]?.message?.parsed;
      if (!parsed) return null;

      const validado = ComparacionCvSchema.safeParse(parsed);
      if (!validado.success) {
        this.logger.warn(
          `Comparación de CV con forma inesperada: ${validado.error.message}`,
        );
        return null;
      }
      return validado.data;
    } catch (err) {
      this.logger.error(
        `No se pudo comparar el CV contra el puesto: ${err instanceof Error ? err.stack : err}`,
      );
      return null;
    }
  }
}
