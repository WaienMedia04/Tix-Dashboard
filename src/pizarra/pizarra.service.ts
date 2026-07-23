import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmojiClima, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { calcularRachas } from '../mural/racha.util';
import { CrearPostDto } from './dto/crear-post.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ReaccionarDto } from './dto/reaccionar.dto';
import { CrearEncuestaDto } from './dto/crear-encuesta.dto';
import { VotarEncuestaDto } from './dto/votar-encuesta.dto';
import { CrearReconocimientoDto } from './dto/crear-reconocimiento.dto';
import { ResponderTriviaDto } from './dto/responder-trivia.dto';
import { ResponderClimaDto } from './dto/responder-clima.dto';
import { CrearTimeCapsulaDto } from './dto/crear-time-capsula.dto';
import { PREGUNTAS_DEL_DIA, FRASES_DEL_DIA } from './contenido-diario.constant';
import { TRIVIA_PREGUNTAS } from './trivia.constant';
import { MISIONES_DEL_DIA } from './mision-diaria.constant';

const LIMITE_POSTS = 20;
const LIMITE_TIMELINE = 15;
const DIAS_TALENTO_NUEVO = 7;

export interface EventoTimeline {
  id: string;
  tipo: 'estampa' | 'nuevo' | 'cumple';
  fecha: Date;
  texto: string;
  talento: { id: string; nombreCompleto: string; fotoUrl: string | null };
}

const INCLUDE_POST = {
  autor: {
    select: {
      id: true,
      nombre: true,
      rol: true,
      talento: { select: { fotoUrl: true } },
    },
  },
  reacciones: { select: { emoji: true, usuarioId: true } },
  comentarios: {
    orderBy: { createdAt: 'asc' },
    include: {
      autor: {
        select: {
          id: true,
          nombre: true,
          talento: { select: { fotoUrl: true } },
        },
      },
    },
  },
} satisfies Prisma.PizarraPostInclude;

type PostConIncludes = Prisma.PizarraPostGetPayload<{
  include: typeof INCLUDE_POST;
}>;

const REGEX_MENCION = /@\[[^\]]+\]\(([a-zA-Z0-9_-]+)\)/g;

@Injectable()
export class PizarraService {
  constructor(private readonly prisma: PrismaService) {}

  /** La pizarra es solo para cuentas humanas — nunca para el tráfico de servicio de ClawLink. */
  private exigirUsuario(actor: Actor) {
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }
    return actor.usuario;
  }

  private async resolverEmpresaId(slug: string, actor: Actor): Promise<string> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!empresa || empresa.id !== actor.empresaId) {
      throw new NotFoundException(`Empresa "${slug}" no encontrada`);
    }
    return empresa.id;
  }

  private async exigirPost(postId: string, empresaId: string) {
    const post = await this.prisma.pizarraPost.findFirst({
      where: { id: postId, empresaId },
    });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return post;
  }

  private extraerMenciones(texto: string): string[] {
    const ids = new Set<string>();
    let match: RegExpExecArray | null;
    REGEX_MENCION.lastIndex = 0;
    while ((match = REGEX_MENCION.exec(texto)) !== null) {
      ids.add(match[1]);
    }
    return Array.from(ids);
  }

  private mapearPost(post: PostConIncludes, usuarioId: string) {
    const grupos = new Map<string, { cantidad: number; mia: boolean }>();
    for (const r of post.reacciones) {
      const g = grupos.get(r.emoji) ?? { cantidad: 0, mia: false };
      g.cantidad += 1;
      if (r.usuarioId === usuarioId) g.mia = true;
      grupos.set(r.emoji, g);
    }

    return {
      id: post.id,
      texto: post.texto,
      createdAt: post.createdAt,
      propio: post.autorUsuarioId === usuarioId,
      autor: {
        id: post.autor.id,
        nombre: post.autor.nombre,
        rol: post.autor.rol,
        fotoUrl: post.autor.talento?.fotoUrl ?? null,
      },
      reacciones: Array.from(grupos.entries()).map(([emoji, v]) => ({
        emoji,
        cantidad: v.cantidad,
        mia: v.mia,
      })),
      comentarios: post.comentarios.map((c) => ({
        id: c.id,
        texto: c.texto,
        createdAt: c.createdAt,
        autor: {
          id: c.autor.id,
          nombre: c.autor.nombre,
          fotoUrl: c.autor.talento?.fotoUrl ?? null,
        },
      })),
    };
  }

  private async obtenerPostCompleto(postId: string, usuarioId: string) {
    const post = await this.prisma.pizarraPost.findUniqueOrThrow({
      where: { id: postId },
      include: INCLUDE_POST,
    });
    return this.mapearPost(post, usuarioId);
  }

  async listarPosts(
    slug: string,
    actor: Actor,
    opts: { cursorId?: string; limit?: number },
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const limit = Math.min(Math.max(opts.limit ?? LIMITE_POSTS, 1), 50);

    let cursorFecha: Date | undefined;
    if (opts.cursorId) {
      const referencia = await this.prisma.pizarraPost.findUnique({
        where: { id: opts.cursorId },
        select: { createdAt: true },
      });
      if (referencia) cursorFecha = referencia.createdAt;
    }

    const posts = await this.prisma.pizarraPost.findMany({
      where: {
        empresaId,
        ...(cursorFecha ? { createdAt: { lt: cursorFecha } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: INCLUDE_POST,
    });

    return {
      data: posts.map((p) => this.mapearPost(p, usuario.id)),
      hayMas: posts.length === limit,
    };
  }

  async crearPost(slug: string, actor: Actor, dto: CrearPostDto) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const post = await this.prisma.pizarraPost.create({
      data: { empresaId, autorUsuarioId: usuario.id, texto: dto.texto.trim() },
    });

    const idsCandidatos = this.extraerMenciones(dto.texto);
    if (idsCandidatos.length > 0) {
      const validos = await this.prisma.usuario.findMany({
        where: { id: { in: idsCandidatos }, empresaId, activo: true },
        select: { id: true },
      });
      if (validos.length > 0) {
        await this.prisma.pizarraMencion.createMany({
          data: validos.map((u) => ({ postId: post.id, usuarioId: u.id })),
          skipDuplicates: true,
        });
      }
    }

    return this.obtenerPostCompleto(post.id, usuario.id);
  }

  async reaccionar(
    slug: string,
    actor: Actor,
    postId: string,
    dto: ReaccionarDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    await this.exigirPost(postId, empresaId);

    const existente = await this.prisma.pizarraReaccion.findUnique({
      where: {
        postId_usuarioId_emoji: {
          postId,
          usuarioId: usuario.id,
          emoji: dto.emoji,
        },
      },
    });

    if (existente) {
      await this.prisma.pizarraReaccion.delete({ where: { id: existente.id } });
    } else {
      await this.prisma.pizarraReaccion.create({
        data: { postId, usuarioId: usuario.id, emoji: dto.emoji },
      });
    }

    return this.obtenerPostCompleto(postId, usuario.id);
  }

  async crearComentario(
    slug: string,
    actor: Actor,
    postId: string,
    dto: CrearComentarioDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    await this.exigirPost(postId, empresaId);

    await this.prisma.pizarraComentario.create({
      data: { postId, autorUsuarioId: usuario.id, texto: dto.texto.trim() },
    });

    return this.obtenerPostCompleto(postId, usuario.id);
  }

  async borrarPost(slug: string, actor: Actor, postId: string) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const post = await this.exigirPost(postId, empresaId);

    const puedeBorrar =
      post.autorUsuarioId === usuario.id ||
      usuario.rol === 'CEO' ||
      usuario.rol === 'RRHH';
    if (!puedeBorrar) {
      throw new ForbiddenException('No puedes borrar esta publicación');
    }

    await this.prisma.pizarraPost.delete({ where: { id: postId } });
    return { ok: true };
  }

  // ===== Contenido diario, encuestas y reconocimiento =====

  private exigirModerador(usuario: { rol: string }) {
    if (usuario.rol !== 'CEO' && usuario.rol !== 'RRHH') {
      throw new ForbiddenException('Solo CEO/RRHH pueden hacer esto');
    }
  }

  private hoyISO(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
    }).format(new Date());
  }

  /** Índice pseudoaleatorio pero determinístico — mismo día, misma semilla, mismo resultado para todos. */
  private indiceDelDia(semilla: string, longitud: number): number {
    let hash = 0;
    for (let i = 0; i < semilla.length; i++) {
      hash = (hash * 31 + semilla.charCodeAt(i)) >>> 0;
    }
    return hash % longitud;
  }

  private contenidoDiario() {
    const hoy = this.hoyISO();
    return {
      pregunta:
        PREGUNTAS_DEL_DIA[this.indiceDelDia(hoy, PREGUNTAS_DEL_DIA.length)],
      frase:
        FRASES_DEL_DIA[
          this.indiceDelDia(`frase-${hoy}`, FRASES_DEL_DIA.length)
        ],
    };
  }

  private misionDelDia(): string {
    const hoy = this.hoyISO();
    return MISIONES_DEL_DIA[
      this.indiceDelDia(`mision-${hoy}`, MISIONES_DEL_DIA.length)
    ];
  }

  private async encuestaActivaParaUsuario(
    empresaId: string,
    usuarioId: string,
  ) {
    const encuesta = await this.prisma.pizarraEncuesta.findFirst({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
      include: { votos: true },
    });
    if (!encuesta) return null;

    const conteos = encuesta.opciones.map(
      (_, i) => encuesta.votos.filter((v) => v.opcionIndex === i).length,
    );
    const miVoto =
      encuesta.votos.find((v) => v.usuarioId === usuarioId)?.opcionIndex ??
      null;

    return {
      id: encuesta.id,
      pregunta: encuesta.pregunta,
      opciones: encuesta.opciones,
      conteos,
      total: encuesta.votos.length,
      miVoto,
      createdAt: encuesta.createdAt,
    };
  }

  private async reconocimientoActivo(empresaId: string) {
    const reconocimiento = await this.prisma.pizarraReconocimiento.findFirst({
      where: { empresaId, activo: true },
      orderBy: { createdAt: 'desc' },
      include: {
        talento: {
          select: { id: true, nombreCompleto: true, fotoUrl: true, rol: true },
        },
      },
    });
    if (!reconocimiento) return null;

    return {
      id: reconocimiento.id,
      titulo: reconocimiento.titulo,
      descripcion: reconocimiento.descripcion,
      createdAt: reconocimiento.createdAt,
      talento: reconocimiento.talento,
    };
  }

  private async climaHoyPropio(
    empresaId: string,
    usuarioId: string,
  ): Promise<EmojiClima | null> {
    const hoy = this.hoyISO();
    const respuesta = await this.prisma.pizarraClimaRespuesta.findUnique({
      where: {
        empresaId_usuarioId_fecha: { empresaId, usuarioId, fecha: hoy },
      },
      select: { emoji: true },
    });
    return respuesta?.emoji ?? null;
  }

  /** Top 5 de la última semana por puntaje IA promedio — leaderboard social, no el reporte gerencial de Rankings. */
  private async rankingSemanal(empresaId: string) {
    const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [talentos, worklogs] = await Promise.all([
      this.prisma.talento.findMany({
        where: {
          empresaId,
          estado: 'activo',
          OR: [
            { usuario: null },
            { usuario: { rol: { notIn: ['CEO', 'RRHH'] } } },
          ],
        },
        select: { id: true, nombreCompleto: true, fotoUrl: true },
      }),
      this.prisma.worklog.findMany({
        where: {
          empresaId,
          fecha: { gte: hace7Dias },
          puntajeIA: { not: null },
        },
        select: { talentoId: true, puntajeIA: true },
      }),
    ]);

    const porTalento = new Map<string, number[]>();
    for (const w of worklogs) {
      if (w.puntajeIA === null) continue;
      const lista = porTalento.get(w.talentoId) ?? [];
      lista.push(w.puntajeIA);
      porTalento.set(w.talentoId, lista);
    }

    return talentos
      .map((t) => {
        const puntajes = porTalento.get(t.id) ?? [];
        const promedio =
          puntajes.length === 0
            ? null
            : puntajes.reduce((a, b) => a + b, 0) / puntajes.length;
        return {
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
          puntaje: promedio,
        };
      })
      .filter((t): t is typeof t & { puntaje: number } => t.puntaje !== null)
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, 5)
      .map((t) => ({ ...t, puntaje: Math.round(t.puntaje * 10) / 10 }));
  }

  private async estampasRecientes(empresaId: string) {
    const estampas = await this.prisma.estampaOtorgada.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        createdAt: true,
        talento: { select: { id: true, nombreCompleto: true, fotoUrl: true } },
        estampaDefinicion: { select: { nombre: true, imagenUrl: true } },
      },
    });

    return estampas.map((e) => ({
      id: e.id,
      createdAt: e.createdAt,
      talento: e.talento,
      estampaNombre: e.estampaDefinicion.nombre,
      estampaImagenUrl: e.estampaDefinicion.imagenUrl,
    }));
  }

  private async eventosProximos(empresaId: string) {
    return this.prisma.boletin.findMany({
      where: { empresaId, tipo: 'EVENTO', fechaEvento: { gte: new Date() } },
      orderBy: { fechaEvento: 'asc' },
      take: 3,
      select: { id: true, titulo: true, fechaEvento: true },
    });
  }

  /** Todo lo que necesita la cabecera de la pizarra en una sola consulta. */
  async panel(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const [
      encuestaActiva,
      reconocimientoActivo,
      rachaPropia,
      climaHoy,
      rankingSemanal,
      estampasRecientes,
      eventosProximos,
    ] = await Promise.all([
      this.encuestaActivaParaUsuario(empresaId, usuario.id),
      this.reconocimientoActivo(empresaId),
      usuario.talentoId
        ? calcularRachas(this.prisma, usuario.talentoId)
        : Promise.resolve(null),
      this.climaHoyPropio(empresaId, usuario.id),
      this.rankingSemanal(empresaId),
      this.estampasRecientes(empresaId),
      this.eventosProximos(empresaId),
    ]);

    return {
      contenidoDiario: this.contenidoDiario(),
      misionDelDia: this.misionDelDia(),
      encuestaActiva,
      reconocimientoActivo,
      rachaPropia,
      climaHoy,
      rankingSemanal,
      estampasRecientes,
      eventosProximos,
    };
  }

  // ===== Clima laboral =====

  async responderClima(slug: string, actor: Actor, dto: ResponderClimaDto) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const hoy = this.hoyISO();

    await this.prisma.pizarraClimaRespuesta.upsert({
      where: {
        empresaId_usuarioId_fecha: {
          empresaId,
          usuarioId: usuario.id,
          fecha: hoy,
        },
      },
      create: {
        empresaId,
        usuarioId: usuario.id,
        fecha: hoy,
        emoji: dto.emoji,
      },
      update: { emoji: dto.emoji },
    });

    return { emoji: dto.emoji };
  }

  /** Quién respondió qué hoy — solo CEO/RRHH. Los compañeros nunca ven esto. */
  async climaEquipoHoy(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const hoy = this.hoyISO();

    const respuestas = await this.prisma.pizarraClimaRespuesta.findMany({
      where: { empresaId, fecha: hoy },
      orderBy: { createdAt: 'desc' },
      select: {
        emoji: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            talento: { select: { fotoUrl: true } },
          },
        },
      },
    });

    const resumen = new Map<EmojiClima, number>();
    for (const r of respuestas) {
      resumen.set(r.emoji, (resumen.get(r.emoji) ?? 0) + 1);
    }

    return {
      total: respuestas.length,
      resumen: Array.from(resumen.entries()).map(([emoji, cantidad]) => ({
        emoji,
        cantidad,
      })),
      respuestas: respuestas.map((r) => ({
        usuarioId: r.usuario.id,
        nombre: r.usuario.nombre,
        fotoUrl: r.usuario.talento?.fotoUrl ?? null,
        emoji: r.emoji,
      })),
    };
  }

  // ===== Time Capsule =====

  async crearTimeCapsula(slug: string, actor: Actor, dto: CrearTimeCapsulaDto) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const fechaApertura = new Date(dto.fechaApertura);
    if (fechaApertura.getTime() <= Date.now()) {
      throw new BadRequestException(
        'La fecha de apertura debe ser en el futuro',
      );
    }

    const capsula = await this.prisma.pizarraTimeCapsula.create({
      data: {
        empresaId,
        usuarioId: usuario.id,
        mensaje: dto.mensaje.trim(),
        fechaApertura,
      },
      select: { id: true, fechaApertura: true, createdAt: true },
    });

    return { ...capsula, abierta: false, mensaje: null as string | null };
  }

  async misTimeCapsulas(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const capsulas = await this.prisma.pizarraTimeCapsula.findMany({
      where: { empresaId, usuarioId: usuario.id },
      orderBy: { fechaApertura: 'asc' },
      select: { id: true, mensaje: true, fechaApertura: true, createdAt: true },
    });

    const ahora = Date.now();
    return capsulas.map((c) => {
      const abierta = c.fechaApertura.getTime() <= ahora;
      return {
        id: c.id,
        fechaApertura: c.fechaApertura,
        createdAt: c.createdAt,
        abierta,
        mensaje: abierta ? c.mensaje : null,
      };
    });
  }

  async crearEncuesta(slug: string, actor: Actor, dto: CrearEncuestaDto) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const opciones = dto.opciones.map((o) => o.trim()).filter(Boolean);
    if (opciones.length < 2) {
      throw new BadRequestException('La encuesta necesita al menos 2 opciones');
    }

    await this.prisma.pizarraEncuesta.create({
      data: {
        empresaId,
        creadoPorUsuarioId: usuario.id,
        pregunta: dto.pregunta.trim(),
        opciones,
      },
    });

    return this.encuestaActivaParaUsuario(empresaId, usuario.id);
  }

  async votarEncuesta(
    slug: string,
    actor: Actor,
    encuestaId: string,
    dto: VotarEncuestaDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const encuesta = await this.prisma.pizarraEncuesta.findFirst({
      where: { id: encuestaId, empresaId },
    });
    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada');
    }
    if (dto.opcionIndex < 0 || dto.opcionIndex >= encuesta.opciones.length) {
      throw new BadRequestException('Opción inválida');
    }

    await this.prisma.pizarraEncuestaVoto.upsert({
      where: {
        encuestaId_usuarioId: { encuestaId, usuarioId: usuario.id },
      },
      create: {
        encuestaId,
        usuarioId: usuario.id,
        opcionIndex: dto.opcionIndex,
      },
      update: { opcionIndex: dto.opcionIndex },
    });

    return this.encuestaActivaParaUsuario(empresaId, usuario.id);
  }

  async crearReconocimiento(
    slug: string,
    actor: Actor,
    dto: CrearReconocimientoDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const talento = await this.prisma.talento.findFirst({
      where: { id: dto.talentoId, empresaId },
    });
    if (!talento) {
      throw new NotFoundException('Talento no encontrado');
    }

    await this.prisma.pizarraReconocimiento.updateMany({
      where: { empresaId, activo: true },
      data: { activo: false },
    });

    await this.prisma.pizarraReconocimiento.create({
      data: {
        empresaId,
        talentoId: dto.talentoId,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion?.trim() || null,
        creadoPorUsuarioId: usuario.id,
      },
    });

    return this.reconocimientoActivo(empresaId);
  }

  // ===== Timeline =====

  async timeline(slug: string, actor: Actor) {
    this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const desde = new Date(
      Date.now() - DIAS_TALENTO_NUEVO * 24 * 60 * 60 * 1000,
    );

    const [estampas, talentosNuevos, talentosConCumple] = await Promise.all([
      this.prisma.estampaOtorgada.findMany({
        where: { empresaId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          talento: {
            select: { id: true, nombreCompleto: true, fotoUrl: true },
          },
          estampaDefinicion: { select: { nombre: true } },
        },
      }),
      this.prisma.talento.findMany({
        where: { empresaId, estado: 'activo', fechaIngreso: { gte: desde } },
        select: {
          id: true,
          nombreCompleto: true,
          fotoUrl: true,
          fechaIngreso: true,
        },
        orderBy: { fechaIngreso: 'desc' },
        take: 5,
      }),
      this.prisma.talento.findMany({
        where: { empresaId, estado: 'activo', fechaNacimiento: { not: null } },
        select: {
          id: true,
          nombreCompleto: true,
          fotoUrl: true,
          fechaNacimiento: true,
        },
      }),
    ]);

    const hoyISO = this.hoyISO();
    const [, mesHoyStr, diaHoyStr] = hoyISO.split('-');
    const mesHoy = Number(mesHoyStr);
    const diaHoy = Number(diaHoyStr);
    const cumpleanerosHoy = talentosConCumple.filter(
      (t) =>
        t.fechaNacimiento!.getUTCMonth() + 1 === mesHoy &&
        t.fechaNacimiento!.getUTCDate() === diaHoy,
    );

    const eventos: EventoTimeline[] = [
      ...estampas.map((e) => ({
        id: `estampa-${e.id}`,
        tipo: 'estampa' as const,
        fecha: e.createdAt,
        texto: `recibió la insignia "${e.estampaDefinicion.nombre}"`,
        talento: e.talento,
      })),
      ...talentosNuevos.map((t) => ({
        id: `nuevo-${t.id}`,
        tipo: 'nuevo' as const,
        fecha: t.fechaIngreso!,
        texto: 'se unió al equipo',
        talento: {
          id: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
        },
      })),
      ...cumpleanerosHoy.map((t) => ({
        id: `cumple-${t.id}`,
        tipo: 'cumple' as const,
        fecha: new Date(),
        texto: 'está de cumpleaños hoy 🎂',
        talento: {
          id: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
        },
      })),
    ];

    eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    return eventos.slice(0, LIMITE_TIMELINE);
  }

  // ===== Trivia del día =====

  private preguntaTriviaDeHoy() {
    const hoy = this.hoyISO();
    return TRIVIA_PREGUNTAS[
      this.indiceDelDia(`trivia-${hoy}`, TRIVIA_PREGUNTAS.length)
    ];
  }

  async triviaHoy(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const hoy = this.hoyISO();
    const pregunta = this.preguntaTriviaDeHoy();

    const respuesta = await this.prisma.pizarraTriviaRespuesta.findUnique({
      where: {
        empresaId_usuarioId_fecha: {
          empresaId,
          usuarioId: usuario.id,
          fecha: hoy,
        },
      },
    });

    return {
      pregunta: pregunta.pregunta,
      opciones: pregunta.opciones,
      yaRespondida: !!respuesta,
      correcta: respuesta?.correcta ?? null,
      correctaIndex: respuesta ? pregunta.correctaIndex : null,
    };
  }

  async responderTrivia(slug: string, actor: Actor, dto: ResponderTriviaDto) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const hoy = this.hoyISO();
    const pregunta = this.preguntaTriviaDeHoy();

    const existente = await this.prisma.pizarraTriviaRespuesta.findUnique({
      where: {
        empresaId_usuarioId_fecha: {
          empresaId,
          usuarioId: usuario.id,
          fecha: hoy,
        },
      },
    });
    if (existente) {
      return {
        pregunta: pregunta.pregunta,
        opciones: pregunta.opciones,
        yaRespondida: true,
        correcta: existente.correcta,
        correctaIndex: pregunta.correctaIndex,
      };
    }

    const correcta = dto.opcionIndex === pregunta.correctaIndex;
    await this.prisma.pizarraTriviaRespuesta.create({
      data: { empresaId, usuarioId: usuario.id, fecha: hoy, correcta },
    });

    return {
      pregunta: pregunta.pregunta,
      opciones: pregunta.opciones,
      yaRespondida: true,
      correcta,
      correctaIndex: pregunta.correctaIndex,
    };
  }

  async triviaRanking(slug: string, actor: Actor) {
    this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const respuestas = await this.prisma.pizarraTriviaRespuesta.groupBy({
      by: ['usuarioId'],
      where: { empresaId, correcta: true },
      _count: { usuarioId: true },
    });

    const ordenado = respuestas
      .sort((a, b) => b._count.usuarioId - a._count.usuarioId)
      .slice(0, 5);

    const usuarios = await this.prisma.usuario.findMany({
      where: { id: { in: ordenado.map((r) => r.usuarioId) } },
      select: {
        id: true,
        nombre: true,
        talento: { select: { fotoUrl: true } },
      },
    });
    const porId = new Map(usuarios.map((u) => [u.id, u]));

    return ordenado.map((r) => {
      const u = porId.get(r.usuarioId);
      return {
        usuarioId: r.usuarioId,
        nombre: u?.nombre ?? '—',
        fotoUrl: u?.talento?.fotoUrl ?? null,
        aciertos: r._count.usuarioId,
      };
    });
  }
}
