import { Injectable, Logger } from '@nestjs/common';
import type { Mistral } from '@mistralai/mistralai';
import { z } from 'zod';

const AnalisisEjecutivoSchema = z.object({
  resumenEjecutivo: z.string(),
  fortalezas: z.array(z.string()),
  riesgos: z.array(z.string()),
  recomendaciones: z.array(z.string()),
});

export type AnalisisEjecutivo = z.infer<typeof AnalisisEjecutivoSchema>;

const MODELO = 'mistral-large-latest';

const PROMPT_BASE = `Eres un analista de RRHH senior. A partir de los datos agregados de desempeño de un equipo (ya calculados — no los inventes ni los cambies), escribe un análisis ejecutivo breve en español dominicano, para que lo lea un CEO o la gerencia de RRHH.

Instrucciones:
- resumenEjecutivo: 2-3 frases con el estado general del equipo en el período.
- fortalezas: 2-4 puntos concretos basados en los datos (ej. empleados con alto puntaje, buen cumplimiento).
- riesgos: 2-4 puntos concretos sobre riesgos reales presentes en los datos (ej. empleados con bajo cumplimiento, puntajes bajos, sin bitácoras).
- recomendaciones: 2-4 acciones concretas y accionables para el CEO/RRHH, ligadas a los riesgos detectados.

No inventes cifras que no estén en los datos. Si los datos son escasos, dilo explícitamente en vez de fabricar detalle.

Datos del período (JSON):
`;

@Injectable()
export class AnalisisEjecutivoService {
  private readonly logger = new Logger(AnalisisEjecutivoService.name);
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
  async generar(datos: unknown): Promise<AnalisisEjecutivo | null> {
    try {
      const client = await this.getClient();
      const response = await client.chat.parse({
        model: MODELO,
        maxTokens: 2048,
        messages: [
          {
            role: 'user',
            content: PROMPT_BASE + JSON.stringify(datos, null, 2),
          },
        ],
        responseFormat: AnalisisEjecutivoSchema,
      });
      const parsed = response.choices?.[0]?.message?.parsed;
      if (!parsed) return null;

      // Revalidado en runtime — el SDK no amarra .parsed al schema exacto.
      const validado = AnalisisEjecutivoSchema.safeParse(parsed);
      if (!validado.success) {
        this.logger.warn(
          `Análisis ejecutivo con forma inesperada: ${validado.error.message}`,
        );
        return null;
      }
      return validado.data;
    } catch (err) {
      this.logger.error(
        `No se pudo generar el análisis ejecutivo: ${err instanceof Error ? err.stack : err}`,
      );
      return null;
    }
  }
}
