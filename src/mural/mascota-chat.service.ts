import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import type { Mistral } from '@mistralai/mistralai';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { MuralService } from './mural.service';

interface MensajeHistorial {
  rol: 'usuario' | 'mascota';
  texto: string;
}

interface MensajeModelo {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  toolCalls?: { id?: string; function: { name: string; arguments: string } }[];
  toolCallId?: string;
  name?: string;
}

const MODELO_MASCOTA =
  process.env.MISTRAL_MASCOTA_MODEL || 'mistral-small-latest';
const MAX_TURNOS_HISTORIAL = 6;
const MAX_VUELTAS_HERRAMIENTAS = 3;

const HERRAMIENTAS = [
  {
    type: 'function' as const,
    function: {
      name: 'consultar_resumen_propio',
      description:
        'Consulta datos reales del talento que está hablando: la fecha de su última bitácora enviada y sus ausencias (vacaciones, permisos, licencias médicas) próximas o recientes.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'actualizar_estado_mural',
      description:
        'Cambia el estado (píldora corta arriba del nombre) del mural del talento, ej. "En reunión", "Almorzando", "Concentrado". Usa cadena vacía para quitar el estado actual.',
      parameters: {
        type: 'object',
        properties: {
          estado: {
            type: 'string',
            description:
              'Texto corto del nuevo estado (máx. 40 caracteres), o vacío para quitarlo',
          },
        },
        required: ['estado'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'dejar_nota_mural',
      description:
        'Deja una nota adhesiva en un mural. Si no se indica destinatarioNombre, la deja en el propio mural del talento. Si se indica, busca a ese compañero por nombre en la empresa y le deja la nota — solo si hay una única coincidencia clara.',
      parameters: {
        type: 'object',
        properties: {
          texto: {
            type: 'string',
            description: 'Contenido de la nota (máx. 280 caracteres)',
          },
          destinatarioNombre: {
            type: 'string',
            description:
              'Nombre (o parte del nombre) del compañero destinatario. Omitir para dejarla en el propio mural.',
          },
        },
        required: ['texto'],
      },
    },
  },
];

/** El SDK tipa `arguments` como objeto o string según cómo lo devuelva la API — se normaliza siempre a string JSON. */
function argumentosAString(
  args: { [k: string]: unknown } | string | undefined,
): string {
  if (args === undefined || args === null) return '{}';
  if (typeof args === 'string') return args;
  try {
    return JSON.stringify(args);
  } catch {
    return '{}';
  }
}

function campoTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

function promptSistema(nombre: string): string {
  return `Eres la mascota animada del mural de ${nombre} en TalentiX, un panel de gestión de talento. Tu personalidad es amigable, breve y motivadora — como Clippy de Microsoft Office pero simpático, no molesto. Respondes SIEMPRE en español, en 1-3 frases cortas: esto se muestra en un globo de diálogo pequeño, no en un chat largo. Puedes usar las herramientas disponibles para consultar datos reales del talento o realizar acciones que te pida (cambiar su estado, dejar una nota en un mural). Nunca inventes datos — si necesitas información real, usa la herramienta correspondiente en vez de suponer. Si te piden algo fuera de tu alcance (editar bitácoras, ver datos privados de otros, etc.), dilo con amabilidad y explica que no puedes hacerlo.`;
}

/**
 * Chat de la mascota del mural — asistente con acciones reales acotadas
 * (consultar datos propios, cambiar el estado del mural, dejar notas). No
 * persiste historial en el servidor: el frontend reenvía los últimos
 * turnos en cada mensaje.
 */
@Injectable()
export class MascotaChatService {
  private readonly logger = new Logger(MascotaChatService.name);
  private clientPromise: Promise<Mistral> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mural: MuralService,
  ) {}

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

  async chat(
    actor: Actor,
    mensaje: string,
    historial: MensajeHistorial[],
  ): Promise<{ respuesta: string }> {
    if (!process.env.MISTRAL_API_KEY) {
      return {
        respuesta:
          'Todavía no tengo mi conexión con la IA configurada — avísale a RRHH.',
      };
    }
    if (actor.type !== 'usuario' || !actor.usuario.talentoId) {
      throw new ForbiddenException(
        'Esta cuenta no tiene un perfil de empleado asociado',
      );
    }
    const talentoId = actor.usuario.talentoId;

    const talento = await this.prisma.talento.findUniqueOrThrow({
      where: { id: talentoId },
      select: { nombreCompleto: true, empresaId: true },
    });

    const mensajes: MensajeModelo[] = [
      {
        role: 'system',
        content: promptSistema(talento.nombreCompleto.split(' ')[0]),
      },
      ...historial.slice(-MAX_TURNOS_HISTORIAL).map(
        (m): MensajeModelo => ({
          role: m.rol === 'usuario' ? 'user' : 'assistant',
          content: m.texto,
        }),
      ),
      { role: 'user', content: mensaje },
    ];

    try {
      const client = await this.getClient();
      let vueltas = 0;
      let respuesta = await this.completar(client, mensajes);

      while (
        respuesta?.toolCalls?.length &&
        vueltas < MAX_VUELTAS_HERRAMIENTAS
      ) {
        mensajes.push({
          role: 'assistant',
          content: respuesta.content ?? null,
          toolCalls: respuesta.toolCalls,
        });
        for (const llamada of respuesta.toolCalls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(llamada.function.arguments || '{}') as Record<
              string,
              unknown
            >;
          } catch {
            // args mal formados — se ejecuta la herramienta con args vacíos
          }
          const resultado = await this.ejecutarHerramienta(
            llamada.function.name,
            args,
            actor,
            talentoId,
            talento.empresaId,
          );
          mensajes.push({
            role: 'tool',
            name: llamada.function.name,
            toolCallId: llamada.id,
            content: JSON.stringify(resultado),
          });
        }
        respuesta = await this.completar(client, mensajes);
        vueltas++;
      }

      const texto = respuesta?.content;
      return {
        respuesta:
          typeof texto === 'string' && texto.trim()
            ? texto.trim()
            : 'No supe qué responder a eso.',
      };
    } catch (err) {
      this.logger.warn(`Chat de mascota falló: ${err}`);
      return {
        respuesta:
          'Tuve un problema pensando la respuesta — intenta de nuevo en un momento.',
      };
    }
  }

  private async completar(
    client: Mistral,
    mensajes: MensajeModelo[],
  ): Promise<MensajeModelo | undefined> {
    const respuesta = await client.chat.complete({
      model: MODELO_MASCOTA,
      messages: mensajes as never,
      tools: HERRAMIENTAS,
      toolChoice: 'auto',
      maxTokens: 400,
      temperature: 0.6,
    });
    const msg = respuesta.choices?.[0]?.message;
    if (!msg) return undefined;
    return {
      role: 'assistant',
      content: typeof msg.content === 'string' ? msg.content : null,
      toolCalls: msg.toolCalls?.map((t) => ({
        id: t.id,
        function: {
          name: t.function.name,
          arguments: argumentosAString(t.function.arguments),
        },
      })),
    };
  }

  private async ejecutarHerramienta(
    nombre: string,
    args: Record<string, unknown>,
    actor: Actor,
    talentoId: string,
    empresaId: string,
  ): Promise<unknown> {
    switch (nombre) {
      case 'consultar_resumen_propio':
        return this.resumenPropio(talentoId);
      case 'actualizar_estado_mural':
        return this.actualizarEstado(actor, campoTexto(args.estado));
      case 'dejar_nota_mural':
        return this.dejarNota(
          actor,
          talentoId,
          empresaId,
          campoTexto(args.texto),
          campoTexto(args.destinatarioNombre) || undefined,
        );
      default:
        return { error: 'Herramienta desconocida' };
    }
  }

  private async resumenPropio(talentoId: string) {
    const hoy = new Date(
      new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z',
    );
    const [ultimaBitacora, ausencias] = await Promise.all([
      this.prisma.worklog.findFirst({
        where: { talentoId, estadoEnvio: { contains: '✅' } },
        orderBy: { fecha: 'desc' },
        select: { fecha: true },
      }),
      this.prisma.ausencia.findMany({
        where: { talentoId, fechaFin: { gte: hoy } },
        orderBy: { fechaInicio: 'asc' },
        take: 3,
        select: { tipo: true, fechaInicio: true, fechaFin: true },
      }),
    ]);
    return {
      ultimaBitacoraEnviada: ultimaBitacora
        ? ultimaBitacora.fecha.toISOString().slice(0, 10)
        : null,
      ausenciasProximas: ausencias.map((a) => ({
        tipo: a.tipo,
        desde: a.fechaInicio.toISOString().slice(0, 10),
        hasta: a.fechaFin.toISOString().slice(0, 10),
      })),
    };
  }

  private async actualizarEstado(actor: Actor, estado: string) {
    const perfil = await this.mural.actualizarPerfil(actor, {
      estado: estado.trim(),
    });
    return { ok: true, estado: perfil.estado };
  }

  private async dejarNota(
    actor: Actor,
    talentoId: string,
    empresaId: string,
    texto: string,
    destinatarioNombre?: string,
  ) {
    const textoLimpio = texto.trim().slice(0, 280);
    if (!textoLimpio) return { error: 'La nota no puede estar vacía' };

    if (!destinatarioNombre?.trim()) {
      const nota = await this.mural.crearNota(actor, { texto: textoLimpio });
      return { ok: true, destino: 'tu propio mural', nota: nota.texto };
    }

    const candidatos = await this.prisma.talento.findMany({
      where: {
        empresaId,
        estado: 'activo',
        id: { not: talentoId },
        nombreCompleto: {
          contains: destinatarioNombre.trim(),
          mode: 'insensitive',
        },
      },
      select: { id: true, nombreCompleto: true },
      take: 5,
    });
    if (candidatos.length === 0) {
      return {
        error: `No encontré a nadie llamado "${destinatarioNombre}" en la empresa.`,
      };
    }
    if (candidatos.length > 1) {
      return {
        error: `Hay varias personas que coinciden con "${destinatarioNombre}": ${candidatos.map((c) => c.nombreCompleto).join(', ')}. Pídele que especifique mejor.`,
      };
    }
    const destino = candidatos[0];
    const nota = await this.mural.crearNotaParaOtro(
      actor,
      destino.id,
      empresaId,
      {
        texto: textoLimpio,
      },
    );
    return { ok: true, destino: destino.nombreCompleto, nota: nota.texto };
  }
}
