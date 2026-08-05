import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calcularNivel } from './nivel.util';

/**
 * Acciones que otorgan XP/monedas — el nombre es el `tipo` que queda en
 * TalentoProgresoEvento, usado junto con `referenciaId` como llave de
 * idempotencia (ver el comentario en el modelo de Prisma).
 */
const RECOMPENSAS = {
  bitacora_enviada: { xp: 15, monedas: 10 },
  trivia_ganada: { xp: 15, monedas: 5 },
  reconocimiento_recibido: { xp: 25, monedas: 20 },
  comentario_publicado: { xp: 5, monedas: 2 },
  post_compartido: { xp: 10, monedas: 15 },
  /** Reconocimiento rápido entre compañeros — menos que el destacado de CEO/RRHH porque no tiene límite de envíos (ver el dedupe por remitente+día en MuralService). */
  reconocimiento_rapido_recibido: { xp: 8, monedas: 5 },
} as const;

export type TipoEventoProgreso = keyof typeof RECOMPENSAS;

@Injectable()
export class ProgresoService {
  private readonly logger = new Logger(ProgresoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Otorga XP/monedas por una acción real del talento. Es idempotente: si ya
   * se otorgó para el mismo (talento, tipo, referenciaId) — ej. la misma
   * bitácora o el mismo comentario — no duplica el premio.
   * `talentoId` puede ser null (cuentas sin perfil de empleado, ej. un
   * CEO/RRHH puro) — en ese caso simplemente no hay progreso que otorgar.
   */
  async otorgar(
    empresaId: string,
    talentoId: string | null | undefined,
    tipo: TipoEventoProgreso,
    referenciaId: string,
  ): Promise<void> {
    const { xp, monedas } = RECOMPENSAS[tipo];
    await this.otorgarMonto(
      empresaId,
      talentoId,
      tipo,
      referenciaId,
      xp,
      monedas,
    );
  }

  /**
   * Igual que `otorgar`, pero para recompensas de monto variable que no
   * salen del catálogo fijo (el cofre diario tiene premio aleatorio, un
   * logro trae su propia recompensa definida en su catálogo).
   */
  async otorgarMonto(
    empresaId: string,
    talentoId: string | null | undefined,
    tipo: string,
    referenciaId: string,
    xp: number,
    monedas: number,
  ): Promise<void> {
    if (!talentoId) return;

    try {
      await this.prisma.$transaction(async (tx) => {
        const progreso = await tx.talentoProgreso.upsert({
          where: { talentoId },
          create: { empresaId, talentoId },
          update: {},
        });
        await tx.talentoProgresoEvento.create({
          data: { progresoId: progreso.id, tipo, referenciaId, xp, monedas },
        });
        await tx.talentoProgreso.update({
          where: { id: progreso.id },
          data: { xp: { increment: xp }, monedas: { increment: monedas } },
        });
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return; // ya se había otorgado para esta misma acción
      }
      this.logger.warn(`No se pudo otorgar progreso (${tipo}): ${err}`);
    }
  }

  /**
   * Descuenta monedas de forma atómica — la condición `monedas: { gte }` en
   * el `where` hace que el update solo aplique si el balance alcanza, así
   * que dos compras simultáneas no pueden dejar el balance en negativo.
   * Devuelve false (sin cobrar nada) si no le alcanzaba.
   */
  async gastar(talentoId: string, monedas: number): Promise<boolean> {
    const resultado = await this.prisma.talentoProgreso.updateMany({
      where: { talentoId, monedas: { gte: monedas } },
      data: { monedas: { decrement: monedas } },
    });
    return resultado.count === 1;
  }

  async obtener(talentoId: string) {
    const progreso = await this.prisma.talentoProgreso.findUnique({
      where: { talentoId },
      select: { xp: true, monedas: true },
    });
    return {
      ...calcularNivel(progreso?.xp ?? 0),
      monedas: progreso?.monedas ?? 0,
    };
  }
}
