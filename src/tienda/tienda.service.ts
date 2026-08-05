import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgresoService } from '../progreso/progreso.service';
import { MARCOS, TITULOS } from './tienda.constant';

export type TipoItemTienda = 'marco' | 'titulo';

@Injectable()
export class TiendaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progreso: ProgresoService,
  ) {}

  private buscarItem(itemId: string): { tipo: TipoItemTienda; precio: number } {
    const marco = MARCOS.find((m) => m.id === itemId);
    if (marco) return { tipo: 'marco', precio: marco.precio };
    const titulo = TITULOS.find((t) => t.id === itemId);
    if (titulo) return { tipo: 'titulo', precio: titulo.precio };
    throw new NotFoundException('Ítem de la tienda no encontrado');
  }

  async catalogo(talentoId: string) {
    const [progreso, comprados, perfil] = await Promise.all([
      this.progreso.obtener(talentoId),
      this.prisma.talentoItemComprado.findMany({
        where: { talentoId },
        select: { itemId: true },
      }),
      this.prisma.talentoPerfilMural.findUnique({
        where: { talentoId },
        select: { marcoId: true, tituloId: true },
      }),
    ]);
    const compradosSet = new Set(comprados.map((c) => c.itemId));

    return {
      monedas: progreso.monedas,
      marcos: MARCOS.map((m) => ({
        ...m,
        comprado: compradosSet.has(m.id),
        equipado: perfil?.marcoId === m.id,
      })),
      titulos: TITULOS.map((t) => ({
        ...t,
        comprado: compradosSet.has(t.id),
        equipado: perfil?.tituloId === t.id,
      })),
    };
  }

  /** Compra idempotente: si ya lo tenía, no le cobra de nuevo. */
  async comprar(empresaId: string, talentoId: string, itemId: string) {
    const yaComprado = await this.prisma.talentoItemComprado.findUnique({
      where: { talentoId_itemId: { talentoId, itemId } },
    });
    if (yaComprado) return this.catalogo(talentoId);

    const { precio } = this.buscarItem(itemId);
    const cobrado = await this.progreso.gastar(talentoId, precio);
    if (!cobrado) {
      throw new BadRequestException('No te alcanzan las monedas para este ítem');
    }

    try {
      await this.prisma.talentoItemComprado.create({
        data: { empresaId, talentoId, itemId },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        // otra request en paralelo ya la registró — le devolvemos las monedas cobradas de más
        await this.prisma.talentoProgreso.update({
          where: { talentoId },
          data: { monedas: { increment: precio } },
        });
      } else {
        throw err;
      }
    }

    return this.catalogo(talentoId);
  }

  async equipar(
    empresaId: string,
    talentoId: string,
    tipo: TipoItemTienda,
    itemId: string | null,
  ) {
    if (itemId !== null) {
      const item = this.buscarItem(itemId);
      if (item.tipo !== tipo) {
        throw new BadRequestException('Este ítem no es de ese tipo');
      }
      const comprado = await this.prisma.talentoItemComprado.findUnique({
        where: { talentoId_itemId: { talentoId, itemId } },
      });
      if (!comprado) {
        throw new BadRequestException('Todavía no compraste este ítem');
      }
    }

    const campo = tipo === 'marco' ? 'marcoId' : 'tituloId';
    await this.prisma.talentoPerfilMural.upsert({
      where: { talentoId },
      create: { talentoId, empresaId, [campo]: itemId },
      update: { [campo]: itemId },
    });

    return this.catalogo(talentoId);
  }
}
