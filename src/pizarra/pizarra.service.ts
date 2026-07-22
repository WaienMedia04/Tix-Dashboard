import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { CrearPostDto } from './dto/crear-post.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ReaccionarDto } from './dto/reaccionar.dto';
import { CrearEncuestaDto } from './dto/crear-encuesta.dto';
import { VotarEncuestaDto } from './dto/votar-encuesta.dto';
import { CrearReconocimientoDto } from './dto/crear-reconocimiento.dto';
import { ResponderTriviaDto } from './dto/responder-trivia.dto';
import { PREGUNTAS_DEL_DIA, FRASES_DEL_DIA } from './contenido-diario.constant';
import { TRIVIA_PREGUNTAS } from './trivia.constant';

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

  /** Todo lo que necesita la cabecera de la pizarra en una sola consulta: contenido del día, encuesta y reconocimiento activos. */
  async panel(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const [encuestaActiva, reconocimientoActivo] = await Promise.all([
      this.encuestaActivaParaUsuario(empresaId, usuario.id),
      this.reconocimientoActivo(empresaId),
    ]);

    return {
      contenidoDiario: this.contenidoDiario(),
      encuestaActiva,
      reconocimientoActivo,
    };
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
