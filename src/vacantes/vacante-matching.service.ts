import { Injectable, Logger } from '@nestjs/common';
import type { Mistral } from '@mistralai/mistralai';
import { z } from 'zod';

const CandidatoEvaluadoSchema = z.object({
  talentoId: z.string(),
  puntaje: z.number().min(0).max(100),
  justificacion: z.string(),
});

const MatchingSchema = z.object({
  candidatos: z.array(CandidatoEvaluadoSchema),
});

export type CandidatoEvaluado = z.infer<typeof CandidatoEvaluadoSchema>;

export interface CandidatoParaEvaluar {
  talentoId: string;
  nombreCompleto: string;
  departamento: string | null;
  resumenParaRRHH: string;
  habilidades: string[];
  experienciaLaboral: {
    empresa: string;
    puesto: string;
    periodo: string | null;
  }[];
  educacion: { institucion: string; titulo: string }[];
}

const MODELO = 'mistral-large-latest';

const PROMPT_BASE = `Eres un reclutador senior de RRHH. Vas a comparar la descripción de una vacante contra el CV ya extraído de varios talentos internos de la empresa, para ver quién podría aplicar o ser considerado.

Instrucciones:
- Evalúa a CADA candidato de la lista, aunque el ajuste sea bajo.
- puntaje: 0-100, qué tan bien encaja el perfil del candidato con la vacante (experiencia, habilidades, educación).
- justificacion: 1-2 frases en español dominicano explicando el puntaje, mencionando algo concreto del CV.
- No inventes datos que no estén en el CV. Si el CV no tiene información relevante, dalo un puntaje bajo y dilo explícitamente.

Vacante:
`;

@Injectable()
export class VacanteMatchingService {
  private readonly logger = new Logger(VacanteMatchingService.name);
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
  async evaluarCandidatos(
    vacante: { titulo: string; descripcion: string },
    candidatos: CandidatoParaEvaluar[],
  ): Promise<CandidatoEvaluado[] | null> {
    if (candidatos.length === 0) return [];

    try {
      const client = await this.getClient();
      const response = await client.chat.parse({
        model: MODELO,
        maxTokens: 4096,
        messages: [
          {
            role: 'user',
            content:
              PROMPT_BASE +
              JSON.stringify(
                { titulo: vacante.titulo, descripcion: vacante.descripcion },
                null,
                2,
              ) +
              '\n\nCandidatos (JSON):\n' +
              JSON.stringify(candidatos, null, 2),
          },
        ],
        responseFormat: MatchingSchema,
      });
      const parsed = response.choices?.[0]?.message?.parsed;
      if (!parsed) return null;

      const validado = MatchingSchema.safeParse(parsed);
      if (!validado.success) {
        this.logger.warn(
          `Matching de candidatos con forma inesperada: ${validado.error.message}`,
        );
        return null;
      }

      const candidatosIds = new Set(candidatos.map((c) => c.talentoId));
      return validado.data.candidatos
        .filter((c) => candidatosIds.has(c.talentoId))
        .sort((a, b) => b.puntaje - a.puntaje);
    } catch (err) {
      this.logger.error(
        `No se pudo evaluar candidatos para la vacante: ${err instanceof Error ? err.stack : err}`,
      );
      return null;
    }
  }
}
