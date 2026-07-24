import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

const AnalisisEjecutivoSchema = z.object({
  resumenEjecutivo: z.string(),
  fortalezas: z.array(z.string()),
  riesgos: z.array(z.string()),
  recomendaciones: z.array(z.string()),
});

export type AnalisisEjecutivo = z.infer<typeof AnalisisEjecutivoSchema>;

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
  private readonly client = new Anthropic();

  /** Devuelve null si la IA no está disponible o falla — nunca lanza. */
  async generar(datos: unknown): Promise<AnalisisEjecutivo | null> {
    try {
      const response = await this.client.messages.parse({
        model: 'claude-opus-4-8',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: PROMPT_BASE + JSON.stringify(datos, null, 2),
          },
        ],
        output_config: { format: zodOutputFormat(AnalisisEjecutivoSchema) },
      });
      return response.parsed_output;
    } catch (err) {
      // A nivel `error` (no `warn`) porque esto nunca debería fallar en
      // producción — si ANTHROPIC_API_KEY falta o es inválida, o el modelo
      // no existe, el SDK lanza acá y antes quedaba enmascarado como un
      // simple "no hay análisis" sin rastro en los logs.
      this.logger.error(
        `No se pudo generar el análisis ejecutivo: ${err instanceof Error ? err.stack : err}`,
      );
      return null;
    }
  }
}
