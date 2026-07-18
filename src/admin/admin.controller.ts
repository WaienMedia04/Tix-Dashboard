import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AdminAuthDto } from './dto/admin-auth.dto';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { EditarEmpresaDto } from './dto/editar-empresa.dto';
import { EstadoEmpresaDto } from './dto/estado-empresa.dto';
import { CrearTalentoAdminDto } from './dto/crear-talento-admin.dto';
import { EditarTalentoAdminDto } from './dto/editar-talento-admin.dto';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { CambiarCorreoDto } from '../auth/dto/cambiar-correo.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  auth(@Body() dto: AdminAuthDto) {
    if (!process.env.ADMIN_TOKEN || dto.token !== process.env.ADMIN_TOKEN) {
      throw new UnauthorizedException('Token inválido');
    }
    return { ok: true };
  }

  @Get('dashboard')
  @UseGuards(AdminGuard)
  dashboard() {
    return this.adminService.dashboard();
  }

  // ── Empresas ─────────────────────────────────────────────────────────────

  @Post('empresas')
  @UseGuards(AdminGuard)
  crearEmpresa(@Body() dto: CrearEmpresaDto) {
    return this.adminService.crearEmpresa(dto);
  }

  @Put('empresas/:id')
  @UseGuards(AdminGuard)
  editarEmpresa(@Param('id') id: string, @Body() dto: EditarEmpresaDto) {
    return this.adminService.editarEmpresa(id, dto);
  }

  @Patch('empresas/:id/estado')
  @UseGuards(AdminGuard)
  cambiarEstadoEmpresa(@Param('id') id: string, @Body() dto: EstadoEmpresaDto) {
    return this.adminService.cambiarEstadoEmpresa(id, dto.activo);
  }

  @Delete('empresas/:id')
  @UseGuards(AdminGuard)
  borrarEmpresa(@Param('id') id: string) {
    return this.adminService.borrarEmpresa(id);
  }

  @Post('empresas/:id/usuarios')
  @UseGuards(AdminGuard)
  crearUsuario(@Param('id') id: string, @Body() dto: CrearUsuarioAdminDto) {
    return this.adminService.crearUsuario(id, dto);
  }

  @Get('empresas/:id/usuarios')
  @UseGuards(AdminGuard)
  usuariosDeEmpresa(@Param('id') id: string) {
    return this.adminService.usuariosDeEmpresa(id);
  }

  @Patch('usuarios/:id/correo')
  @UseGuards(AdminGuard)
  cambiarCorreoUsuario(@Param('id') id: string, @Body() dto: CambiarCorreoDto) {
    return this.adminService.cambiarCorreoUsuario(id, dto.email);
  }

  @Post('usuarios/:id/restablecer-password')
  @UseGuards(AdminGuard)
  restablecerPasswordUsuario(@Param('id') id: string) {
    return this.adminService.restablecerPasswordUsuario(id);
  }

  // ── Empleados por empresa ─────────────────────────────────────────────────

  @Get('empresas/:id/empleados')
  @UseGuards(AdminGuard)
  empleadosDeEmpresa(@Param('id') id: string) {
    return this.adminService.empleadosDeEmpresa(id);
  }

  @Post('empresas/:id/empleados')
  @UseGuards(AdminGuard)
  crearEmpleado(@Param('id') id: string, @Body() dto: CrearTalentoAdminDto) {
    return this.adminService.crearEmpleado(id, dto);
  }

  // ── Talentos individuales ─────────────────────────────────────────────────

  @Get('talentos/:id')
  @UseGuards(AdminGuard)
  fichaTalento(@Param('id') id: string) {
    return this.adminService.fichaTalento(id);
  }

  @Put('talentos/:id')
  @UseGuards(AdminGuard)
  editarTalento(@Param('id') id: string, @Body() dto: EditarTalentoAdminDto) {
    return this.adminService.editarTalento(id, dto);
  }

  @Patch('talentos/:id/estado')
  @UseGuards(AdminGuard)
  cambiarEstadoTalento(
    @Param('id') id: string,
    @Body('estado') estado: 'activo' | 'inactivo',
  ) {
    if (estado !== 'activo' && estado !== 'inactivo') {
      throw new UnauthorizedException('estado debe ser activo o inactivo');
    }
    return this.adminService.cambiarEstadoTalento(id, estado);
  }

  @Delete('talentos/:id')
  @UseGuards(AdminGuard)
  borrarTalento(@Param('id') id: string) {
    return this.adminService.borrarTalento(id);
  }
}
