import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
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
  experienciaLaboral: { empresa: string; puesto: string; periodo: string | null }[];
  educacion: { institucion: string; titulo: string }[];
}

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
  private readonly client = new Anthropic();

  /** Devuelve null si la IA no está disponible o falla — nunca lanza. */
  async evaluarCandidatos(
    vacante: { titulo: string; descripcion: string },
    candidatos: CandidatoParaEvaluar[],
  ): Promise<CandidatoEvaluado[] | null> {
    if (candidatos.length === 0) return [];

    try {
      const response = await this.client.messages.parse({
        model: 'claude-opus-4-8',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content:
              PROMPT_BASE +
              JSON.stringify({ titulo: vacante.titulo, descripcion: vacante.descripcion }, null, 2) +
              '\n\nCandidatos (JSON):\n' +
              JSON.stringify(candidatos, null, 2),
          },
        ],
        output_config: { format: zodOutputFormat(MatchingSchema) },
      });
      const candidatosIds = new Set(candidatos.map((c) => c.talentoId));
      return (response.parsed_output?.candidatos ?? [])
        .filter((c) => candidatosIds.has(c.talentoId))
        .sort((a, b) => b.puntaje - a.puntaje);
    } catch (err) {
      this.logger.warn(`No se pudo evaluar candidatos para la vacante: ${err}`);
      return null;
    }
  }
}
