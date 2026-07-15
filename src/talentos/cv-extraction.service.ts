import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { extractText } from 'unpdf';

const CvExtraidoSchema = z.object({
  nombre: z.string().nullable(),
  contacto: z.object({
    correo: z.string().nullable(),
    telefono: z.string().nullable(),
  }),
  experienciaLaboral: z.array(
    z.object({
      empresa: z.string(),
      puesto: z.string(),
      periodo: z.string().nullable(),
      descripcion: z.string().nullable(),
    }),
  ),
  educacion: z.array(
    z.object({
      institucion: z.string(),
      titulo: z.string(),
      anio: z.string().nullable(),
    }),
  ),
  habilidades: z.array(z.string()),
  resumenParaRRHH: z.string(),
});

export type CvExtraido = z.infer<typeof CvExtraidoSchema>;

const PROMPT_EXTRACCION = `Extrae la información estructurada de este currículum (CV). Si un campo no está presente en el documento, usa null (o un arreglo vacío para las listas). En "resumenParaRRHH" escribe 2-3 frases en español evaluando fortalezas destacables y para qué otros roles dentro de la empresa podría aplicar esta persona.

Currículum:
`;

@Injectable()
export class CvExtractionService {
  private readonly logger = new Logger(CvExtractionService.name);
  private readonly client = new Anthropic();

  /**
   * Descarga el PDF, extrae el texto y le pide a Claude que lo estructure.
   * Devuelve null si el PDF no se pudo leer o el modelo no devolvió un
   * resultado válido — nunca lanza, el llamador decide cómo informarlo.
   */
  async extraerDesdeUrl(cvUrl: string): Promise<CvExtraido | null> {
    let texto: string;
    try {
      const res = await fetch(cvUrl);
      if (!res.ok) throw new Error(`descarga falló: ${res.status}`);
      const buffer = new Uint8Array(await res.arrayBuffer());
      const extraido = await extractText(buffer, { mergePages: true });
      texto = extraido.text;
    } catch (err) {
      this.logger.warn(`No se pudo leer el PDF del CV (${cvUrl}): ${err}`);
      return null;
    }

    if (!texto.trim()) {
      this.logger.warn(`El PDF del CV no tiene texto extraíble (${cvUrl})`);
      return null;
    }

    try {
      const response = await this.client.messages.parse({
        model: 'claude-opus-4-8',
        max_tokens: 4096,
        messages: [{ role: 'user', content: PROMPT_EXTRACCION + texto }],
        output_config: { format: zodOutputFormat(CvExtraidoSchema) },
      });
      return response.parsed_output;
    } catch (err) {
      this.logger.warn(`Extracción de CV con Claude falló (${cvUrl}): ${err}`);
      return null;
    }
  }
}
