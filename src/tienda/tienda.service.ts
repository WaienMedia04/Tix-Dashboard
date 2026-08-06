import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgresoService } from '../progreso/progreso.service';
import {
  BORDES_NOTA,
  COLORES_NOMBRE,
  FONDOS,
  MARCOS,
  MASCOTAS,
  TITULOS,
} from './tienda.constant';

export type TipoItemTienda =
  | 'marco'
  | 'titulo'
  | 'fondo'
  | 'mascota'
  | 'colorNombre'
  | 'bordeNota';

/** A diferencia de marcoId/tituloId (nullables), TalentoPerfilMural.fondoId nunca es null — tiene un fondo gratis por defecto. */
const FONDO_POR_DEFECTO = 'corcho';

/** Igual que fondoId: TalentoPerfilMural.colorNombreId nunca es null — siempre tiene un color gratis por defecto. */
const COLOR_NOMBRE_POR_DEFECTO = 'cian_magenta';

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
    const fondo = FONDOS.find((f) => f.id === itemId);
    if (fondo) return { tipo: 'fondo', precio: fondo.precio };
    const mascota = MASCOTAS.find((m) => m.id === itemId);
    if (mascota) return { tipo: 'mascota', precio: mascota.precio };
    const colorNombre = COLORES_NOMBRE.find((c) => c.id === itemId);
    if (colorNombre) return { tipo: 'colorNombre', precio: colorNombre.precio };
    const bordeNota = BORDES_NOTA.find((b) => b.id === itemId);
    if (bordeNota) return { tipo: 'bordeNota', precio: bordeNota.precio };
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
        select: {
          marcoId: true,
          tituloId: true,
          fondoId: true,
          mascotaId: true,
          colorNombreId: true,
        },
      }),
    ]);
    const compradosSet = new Set(comprados.map((c) => c.itemId));

    return {
      monedas: progreso.monedas,
      // A diferencia de marco/titulo (siempre null o un ítem de la Tienda),
      // mascotaId puede ser una de las 3 gratis (clippy/bonzi/f1), que no
      // aparecen en MASCOTAS — sin este campo, el front no podría distinguir
      // "no tiene mascota" de "tiene una gratis puesta".
      mascotaEquipadaId: perfil?.mascotaId ?? null,
      // Igual que fondoId: colorNombreId nunca es null (siempre tiene el
      // gratis por defecto), así que el front necesita el valor real acá
      // para saber cuál de los 9 colores gratis está puesto.
      colorNombreEquipadoId: perfil?.colorNombreId ?? COLOR_NOMBRE_POR_DEFECTO,
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
      fondos: FONDOS.map((f) => ({
        ...f,
        comprado: compradosSet.has(f.id),
        equipado: perfil?.fondoId === f.id,
      })),
      mascotas: MASCOTAS.map((m) => ({
        ...m,
        comprado: compradosSet.has(m.id),
        equipado: perfil?.mascotaId === m.id,
      })),
      coloresNombre: COLORES_NOMBRE.map((c) => ({
        ...c,
        comprado: compradosSet.has(c.id),
        equipado: perfil?.colorNombreId === c.id,
      })),
      // Sin "equipado": un borde de nota no vive en el perfil, se elige por
      // nota individual (MuralNotaAdhesiva.bordeId, ver MuralService).
      bordesNota: BORDES_NOTA.map((b) => ({
        ...b,
        comprado: compradosSet.has(b.id),
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
      throw new BadRequestException(
        'No te alcanzan las monedas para este ítem',
      );
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

    if (tipo === 'fondo') {
      const fondoId = itemId ?? FONDO_POR_DEFECTO;
      await this.prisma.talentoPerfilMural.upsert({
        where: { talentoId },
        create: { talentoId, empresaId, fondoId },
        update: { fondoId },
      });
    } else if (tipo === 'colorNombre') {
      const colorNombreId = itemId ?? COLOR_NOMBRE_POR_DEFECTO;
      await this.prisma.talentoPerfilMural.upsert({
        where: { talentoId },
        create: { talentoId, empresaId, colorNombreId },
        update: { colorNombreId },
      });
    } else {
      const campo =
        tipo === 'marco'
          ? 'marcoId'
          : tipo === 'titulo'
            ? 'tituloId'
            : 'mascotaId';
      await this.prisma.talentoPerfilMural.upsert({
        where: { talentoId },
        create: { talentoId, empresaId, [campo]: itemId },
        update: { [campo]: itemId },
      });
    }

    return this.catalogo(talentoId);
  }
}
