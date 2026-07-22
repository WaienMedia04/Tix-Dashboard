import {
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

const LIMITE_POSTS = 20;

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
}
