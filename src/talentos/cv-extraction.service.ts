import { Injectable, Logger } from '@nestjs/common';
import type { Mistral } from '@mistralai/mistralai';
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
  private clientPromise: Promise<Mistral> | null = null;

  // @mistralai/mistralai v2 es ESM-only (sin build CJS) y este proyecto
  // compila a CommonJS — un `import` estático se convertiría en un
  // `require()` que Node no puede resolver contra un paquete ESM puro.
  // El import dinámico es el mecanismo de interop correcto en este caso.
  private async getClient(): Promise<Mistral> {
    if (!this.clientPromise) {
      this.clientPromise = import('@mistralai/mistralai').then(
        ({ Mistral: MistralClient }) =>
          new MistralClient({ apiKey: process.env.MISTRAL_API_KEY }),
      );
    }
    return this.clientPromise;
  }

  /**
   * Descarga el PDF, extrae el texto y le pide a Mistral que lo estructure.
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
      const client = await this.getClient();
      const response = await client.chat.parse({
        model: 'mistral-large-latest',
        maxTokens: 4096,
        messages: [{ role: 'user', content: PROMPT_EXTRACCION + texto }],
        responseFormat: CvExtraidoSchema,
      });
      const parsed = response.choices?.[0]?.message?.parsed;
      if (!parsed) return null;

      // El tipo que devuelve el SDK para .parsed no queda amarrado al
      // schema específico pasado en responseFormat, así que se revalida
      // en runtime — también nos protege si el modelo alguna vez devuelve
      // una forma inesperada pese al responseFormat.
      const validado = CvExtraidoSchema.safeParse(parsed);
      if (!validado.success) {
        this.logger.warn(
          `Mistral devolvió un CV con forma inesperada (${cvUrl}): ${validado.error.message}`,
        );
        return null;
      }
      return validado.data;
    } catch (err) {
      this.logger.warn(`Extracción de CV con Mistral falló (${cvUrl}): ${err}`);
      return null;
    }
  }
}
