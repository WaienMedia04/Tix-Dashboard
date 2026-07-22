import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { talentoScopeWhere } from '../auth/talento-scope.util';
import { validarDepartamentoPermitido } from '../empresas/departamento.util';
import { CrearVacanteDto } from './dto/crear-vacante.dto';
import { ActualizarVacanteDto } from './dto/actualizar-vacante.dto';
import {
  VacanteMatchingService,
  type CandidatoParaEvaluar,
} from './vacante-matching.service';
import type { CvExtraido } from '../talentos/cv-extraction.service';

const LIMITE_VACANTES = 100;

const SELECT_VACANTE = {
  id: true,
  titulo: true,
  descripcion: true,
  departamento: true,
  estado: true,
  createdAt: true,
  updatedAt: true,
  creadoPor: { select: { id: true, nombre: true } },
} as const;

function mapear(v: {
  id: string;
  titulo: string;
  descripcion: string;
  departamento: string | null;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
  creadoPor: { id: string; nombre: string };
}) {
  return {
    id: v.id,
    titulo: v.titulo,
    descripcion: v.descripcion,
    departamento: v.departamento,
    estado: v.estado,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    autorNombre: v.creadoPor.nombre,
  };
}

/**
 * Vacantes publicadas por CEO/RRHH — de una sola vía: cualquier usuario
 * puede leerlas (los talentos las ven en el mural informativo), pero solo
 * CEO/RRHH puede publicar, editar, borrar o escanear candidatos internos.
 */
@Injectable()
export class VacantesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matching: VacanteMatchingService,
  ) {}

  private exigirUsuario(actor: Actor) {
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }
    return actor.usuario;
  }

  private exigirModerador(usuario: { rol: string }) {
    if (usuario.rol !== 'CEO' && usuario.rol !== 'RRHH') {
      throw new ForbiddenException('Solo CEO/RRHH pueden hacer esto');
    }
  }

  private async resolverEmpresa(slug: string, actor: Actor) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!empresa || empresa.id !== actor.empresaId) {
      throw new NotFoundException(`Empresa "${slug}" no encontrada`);
    }
    return empresa;
  }

  async listar(slug: string, actor: Actor) {
    this.exigirUsuario(actor);
    const empresa = await this.resolverEmpresa(slug, actor);

    const vacantes = await this.prisma.vacante.findMany({
      where: { empresaId: empresa.id },
      orderBy: { createdAt: 'desc' },
      take: LIMITE_VACANTES,
      select: SELECT_VACANTE,
    });

    return vacantes.map(mapear);
  }

  async crear(slug: string, actor: Actor, dto: CrearVacanteDto) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresa = await this.resolverEmpresa(slug, actor);
    await validarDepartamentoPermitido(
      this.prisma,
      empresa.id,
      dto.departamento?.trim(),
    );

    const vacante = await this.prisma.vacante.create({
      data: {
        empresaId: empresa.id,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion.trim(),
        departamento: dto.departamento?.trim() || null,
        creadoPorUsuarioId: usuario.id,
      },
      select: SELECT_VACANTE,
    });

    return mapear(vacante);
  }

  private async exigirVacante(id: string, empresaId: string) {
    const vacante = await this.prisma.vacante.findFirst({
      where: { id, empresaId },
    });
    if (!vacante) {
      throw new NotFoundException('Vacante no encontrada');
    }
    return vacante;
  }

  async actualizar(
    slug: string,
    actor: Actor,
    id: string,
    dto: ActualizarVacanteDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresa = await this.resolverEmpresa(slug, actor);
    await this.exigirVacante(id, empresa.id);
    if (dto.departamento !== undefined) {
      await validarDepartamentoPermitido(
        this.prisma,
        empresa.id,
        dto.departamento?.trim(),
      );
    }

    const vacante = await this.prisma.vacante.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.descripcion !== undefined && {
          descripcion: dto.descripcion.trim(),
        }),
        ...(dto.departamento !== undefined && {
          departamento: dto.departamento?.trim() || null,
        }),
        ...(dto.estado !== undefined && { estado: dto.estado }),
      },
      select: SELECT_VACANTE,
    });

    return mapear(vacante);
  }

  async borrar(slug: string, actor: Actor, id: string) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresa = await this.resolverEmpresa(slug, actor);
    await this.exigirVacante(id, empresa.id);

    await this.prisma.vacante.delete({ where: { id } });
    return { ok: true };
  }

  /**
   * Escanea los CV ya analizados de los talentos activos de la empresa y
   * pide a la IA que evalúe qué tan bien encajan con esta vacante. No
   * vuelve a leer el PDF — usa el cvDatosExtraidos que ya quedó guardado
   * quien subió el CV (o la revisión manual posterior).
   */
  async candidatosInternos(slug: string, actor: Actor, id: string) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresa = await this.resolverEmpresa(slug, actor);
    const vacante = await this.exigirVacante(id, empresa.id);

    const talentos = await this.prisma.talento.findMany({
      where: {
        ...talentoScopeWhere(actor),
        estado: 'activo',
        cvDatosExtraidos: { not: Prisma.JsonNull },
      },
      select: {
        id: true,
        nombreCompleto: true,
        fotoUrl: true,
        departamento: true,
        cvDatosExtraidos: true,
      },
    });

    if (talentos.length === 0) {
      return { evaluados: false, candidatos: [] };
    }

    const candidatosParaEvaluar: CandidatoParaEvaluar[] = talentos.map((t) => {
      const cv = t.cvDatosExtraidos as unknown as CvExtraido;
      return {
        talentoId: t.id,
        nombreCompleto: t.nombreCompleto,
        departamento: t.departamento,
        resumenParaRRHH: cv.resumenParaRRHH,
        habilidades: cv.habilidades,
        experienciaLaboral: cv.experienciaLaboral.map((e) => ({
          empresa: e.empresa,
          puesto: e.puesto,
          periodo: e.periodo,
        })),
        educacion: cv.educacion.map((e) => ({
          institucion: e.institucion,
          titulo: e.titulo,
        })),
      };
    });

    const evaluados = await this.matching.evaluarCandidatos(
      { titulo: vacante.titulo, descripcion: vacante.descripcion },
      candidatosParaEvaluar,
    );
    if (evaluados === null) {
      return { evaluados: false, candidatos: [] };
    }

    const talentosPorId = new Map(talentos.map((t) => [t.id, t]));
    return {
      evaluados: true,
      candidatos: evaluados
        .map((e) => {
          const t = talentosPorId.get(e.talentoId);
          if (!t) return null;
          return {
            talentoId: t.id,
            nombreCompleto: t.nombreCompleto,
            fotoUrl: t.fotoUrl,
            departamento: t.departamento,
            puntaje: e.puntaje,
            justificacion: e.justificacion,
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null),
    };
  }
}
