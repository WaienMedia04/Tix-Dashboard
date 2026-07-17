import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { obtenerClienteServiceRole } from '../auth/supabase-auth.util';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { EditarEmpresaDto } from './dto/editar-empresa.dto';
import { EditarTalentoAdminDto } from './dto/editar-talento-admin.dto';
import { CrearTalentoAdminDto } from './dto/crear-talento-admin.dto';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';

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
          codigoAcceso: true,
          botToken: true,
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
        codigoAcceso: e.codigoAcceso,
        botToken: e.botToken,
        createdAt: e.createdAt,
        totalEmpleados: e._count.talentos,
        totalBitacoras: e._count.worklogs,
      })),
    };
  }

  async crearEmpresa(dto: CrearEmpresaDto) {
    const slug = dto.slug ?? this.generarSlug(dto.nombre);
    const codigoAcceso = dto.codigoAcceso?.trim() || this.generarCodigo();
    const botToken = this.generarBotToken();

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
      data: {
        nombre: dto.nombre.trim(),
        slug,
        plan: dto.plan,
        codigoAcceso,
        botToken,
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        plan: true,
        activo: true,
        codigoAcceso: true,
        botToken: true,
        createdAt: true,
      },
    });
  }

  async editarEmpresa(id: string, dto: EditarEmpresaDto) {
    await this.validarEmpresaExiste(id);

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
        botToken: true,
        createdAt: true,
      },
    });
  }

  async cambiarEstadoEmpresa(id: string, activo: boolean) {
    await this.validarEmpresaExiste(id);
    return this.prisma.empresa.update({
      where: { id },
      data: { activo },
      select: { id: true, nombre: true, activo: true },
    });
  }

  async borrarEmpresa(id: string) {
    await this.validarEmpresaExiste(id);
    await this.prisma.empresa.delete({ where: { id } });
    return { ok: true };
  }

  async empleadosDeEmpresa(id: string) {
    await this.validarEmpresaExiste(id);
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
    await this.validarEmpresaExiste(empresaId);
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

  async fichaTalento(talentoId: string) {
    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
      select: {
        id: true,
        nombreCompleto: true,
        rol: true,
        estado: true,
        cedula: true,
        correo: true,
        telefono: true,
        fechaIngreso: true,
        fechaNacimiento: true,
        direccion: true,
        notas: true,
        empresa: { select: { nombre: true, slug: true } },
      },
    });
    if (!talento) throw new NotFoundException('Empleado no encontrado');

    const [worklogs, totalBitacoras, enviadas, agg] = await Promise.all([
      this.prisma.worklog.findMany({
        where: { talentoId },
        orderBy: { fecha: 'desc' },
        take: 50,
        select: {
          id: true,
          fecha: true,
          estadoEnvio: true,
          puntajeIA: true,
          actividadesRealizadas: true,
          horaEnvio: true,
          semana: true,
          dia: true,
        },
      }),
      this.prisma.worklog.count({ where: { talentoId } }),
      this.prisma.worklog.count({
        where: { talentoId, estadoEnvio: 'enviada' },
      }),
      this.prisma.worklog.aggregate({
        where: { talentoId },
        _avg: { puntajeIA: true },
      }),
    ]);

    const puntajePromedio = agg._avg.puntajeIA
      ? Math.round(agg._avg.puntajeIA)
      : null;
    const cumplimiento =
      totalBitacoras > 0 ? Math.round((enviadas / totalBitacoras) * 100) : 0;

    return {
      ...talento,
      metricas: { totalBitacoras, puntajePromedio, cumplimiento },
      worklogs,
    };
  }

  async editarTalento(talentoId: string, dto: EditarTalentoAdminDto) {
    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
    });
    if (!talento) throw new NotFoundException('Empleado no encontrado');

    return this.prisma.talento.update({
      where: { id: talentoId },
      data: {
        ...(dto.nombreCompleto && {
          nombreCompleto: dto.nombreCompleto.trim(),
        }),
        ...(dto.rol && { rol: dto.rol.trim() }),
        ...(dto.cedula !== undefined && { cedula: dto.cedula?.trim() || null }),
        ...(dto.correo !== undefined && { correo: dto.correo?.trim() || null }),
        ...(dto.telefono !== undefined && {
          telefono: dto.telefono?.trim() || null,
        }),
        ...(dto.fechaIngreso !== undefined && {
          fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : null,
        }),
        ...(dto.fechaNacimiento !== undefined && {
          fechaNacimiento: dto.fechaNacimiento
            ? new Date(dto.fechaNacimiento)
            : null,
        }),
        ...(dto.direccion !== undefined && {
          direccion: dto.direccion?.trim() || null,
        }),
        ...(dto.notas !== undefined && { notas: dto.notas?.trim() || null }),
      },
      select: {
        id: true,
        nombreCompleto: true,
        rol: true,
        estado: true,
        cedula: true,
        correo: true,
        telefono: true,
        fechaIngreso: true,
        fechaNacimiento: true,
        direccion: true,
        notas: true,
      },
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

  async borrarTalento(talentoId: string) {
    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
    });
    if (!talento) throw new NotFoundException('Empleado no encontrado');
    await this.prisma.talento.delete({ where: { id: talentoId } });
    return { ok: true };
  }

  /**
   * Crea el usuario humano de una empresa y le envía una invitación por
   * correo vía Supabase Auth: la persona fija su propia contraseña desde
   * el link recibido, nunca la conocemos en texto plano. El Usuario en
   * Neon queda con passwordEstablecida: false hasta que complete ese paso.
   */
  async crearUsuario(empresaId: string, dto: CrearUsuarioAdminDto) {
    await this.validarEmpresaExiste(empresaId);

    const email = dto.email.trim().toLowerCase();
    const existente = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    if (dto.rol === 'TALENTO' && !dto.talentoId) {
      throw new ConflictException(
        'talentoId es obligatorio para crear un usuario con rol TALENTO',
      );
    }

    const origenDashboard = (process.env.CORS_ORIGIN ?? '')
      .split(',')[0]
      ?.trim();
    if (!origenDashboard) {
      throw new InternalServerErrorException(
        'CORS_ORIGIN no está configurado; no se puede armar el link de invitación',
      );
    }

    const { data, error } = await obtenerClienteServiceRole().auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${origenDashboard}/auth/confirm`,
        data: { nombre: dto.nombre.trim(), rol: dto.rol },
      },
    );
    if (error || !data?.user) {
      throw new ConflictException(
        `No se pudo enviar la invitación: ${error?.message ?? 'error desconocido'}`,
      );
    }

    const usuario = await this.prisma.usuario.create({
      data: {
        empresaId,
        email,
        nombre: dto.nombre.trim(),
        rol: dto.rol,
        talentoId: dto.talentoId,
        supabaseUserId: data.user.id,
      },
      select: { id: true, email: true, nombre: true, rol: true },
    });

    return { usuario, invitacionEnviada: true };
  }

  private async validarEmpresaExiste(id: string) {
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

  private generarBotToken(): string {
    return randomBytes(20).toString('hex');
  }
}
