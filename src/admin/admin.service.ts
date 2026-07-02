import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { EditarEmpresaDto } from './dto/editar-empresa.dto';
import { CrearTalentoAdminDto } from './dto/crear-talento-admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [empresas, totalTalentos, totalWorklogs] = await Promise.all([
      this.prisma.empresa.findMany({
        select: {
          id: true,
          nombre: true,
          slug: true,
          plan: true,
          activo: true,
          createdAt: true,
          _count: { select: { talentos: true, worklogs: true } },
        },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.talento.count(),
      this.prisma.worklog.count(),
    ]);

    return {
      resumen: {
        totalEmpresas: empresas.length,
        empresasActivas: empresas.filter((e) => e.activo).length,
        empresasInactivas: empresas.filter((e) => !e.activo).length,
        totalEmpleados: totalTalentos,
        totalBitacoras: totalWorklogs,
      },
      empresas: empresas.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        slug: e.slug,
        plan: e.plan,
        activo: e.activo,
        createdAt: e.createdAt,
        totalEmpleados: e._count.talentos,
        totalBitacoras: e._count.worklogs,
      })),
    };
  }

  async crearEmpresa(dto: CrearEmpresaDto) {
    const slug = dto.slug ?? this.generarSlug(dto.nombre);
    const codigoAcceso = dto.codigoAcceso?.trim() || this.generarCodigo();

    const [slugExistente, codigoExistente] = await Promise.all([
      this.prisma.empresa.findUnique({ where: { slug } }),
      this.prisma.empresa.findFirst({ where: { codigoAcceso } }),
    ]);
    if (slugExistente)
      throw new ConflictException(`El slug "${slug}" ya está en uso`);
    if (codigoExistente)
      throw new ConflictException(
        'El código de acceso ya está en uso por otra empresa',
      );

    return this.prisma.empresa.create({
      data: { nombre: dto.nombre.trim(), slug, plan: dto.plan, codigoAcceso },
      select: {
        id: true,
        nombre: true,
        slug: true,
        plan: true,
        activo: true,
        codigoAcceso: true,
        createdAt: true,
      },
    });
  }

  async editarEmpresa(id: string, dto: EditarEmpresaDto) {
    await this.validarExiste(id);

    if (dto.codigoAcceso) {
      const existente = await this.prisma.empresa.findFirst({
        where: { codigoAcceso: dto.codigoAcceso, NOT: { id } },
      });
      if (existente)
        throw new ConflictException(
          'El código de acceso ya está en uso por otra empresa',
        );
    }

    return this.prisma.empresa.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre.trim() }),
        ...(dto.plan && { plan: dto.plan }),
        ...(dto.codigoAcceso && { codigoAcceso: dto.codigoAcceso.trim() }),
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        plan: true,
        activo: true,
        codigoAcceso: true,
        createdAt: true,
      },
    });
  }

  async cambiarEstadoEmpresa(id: string, activo: boolean) {
    await this.validarExiste(id);
    return this.prisma.empresa.update({
      where: { id },
      data: { activo },
      select: { id: true, nombre: true, activo: true },
    });
  }

  async empleadosDeEmpresa(id: string) {
    await this.validarExiste(id);
    return this.prisma.talento.findMany({
      where: { empresaId: id },
      select: {
        id: true,
        nombreCompleto: true,
        rol: true,
        estado: true,
        _count: { select: { worklogs: true } },
      },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  async crearEmpleado(empresaId: string, dto: CrearTalentoAdminDto) {
    await this.validarExiste(empresaId);
    return this.prisma.talento.create({
      data: {
        empresaId,
        nombreCompleto: dto.nombreCompleto.trim(),
        rol: dto.rol.trim(),
        estado: 'activo',
      },
      select: { id: true, nombreCompleto: true, rol: true, estado: true },
    });
  }

  async cambiarEstadoTalento(talentoId: string, estado: 'activo' | 'inactivo') {
    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
    });
    if (!talento) throw new NotFoundException('Empleado no encontrado');
    return this.prisma.talento.update({
      where: { id: talentoId },
      data: { estado },
      select: { id: true, nombreCompleto: true, estado: true },
    });
  }

  private async validarExiste(id: string) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  private generarSlug(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private generarCodigo(): string {
    return randomBytes(6).toString('hex').toUpperCase();
  }
}
