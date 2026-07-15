import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  generarTokenSesion,
  hashTokenSesion,
  opcionesCookieSesion,
  SESSION_COOKIE,
  SESSION_DURACION_MS,
} from './session.util';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string, req: Request, res: Response) {
    const credencialesInvalidas = () =>
      new UnauthorizedException('Correo o contraseña incorrectos');

    const usuario = await this.prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!usuario || !usuario.activo) {
      throw credencialesInvalidas();
    }

    const valido = await bcrypt.compare(password, usuario.passwordHash);
    if (!valido) {
      throw credencialesInvalidas();
    }

    const empresa = await this.prisma.empresa.findUnique({
      where: { id: usuario.empresaId },
      select: { slug: true, nombre: true, activo: true },
    });
    if (!empresa || !empresa.activo) {
      throw new UnauthorizedException('Empresa inactiva');
    }

    const token = generarTokenSesion();
    await this.prisma.sesion.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: hashTokenSesion(token),
        expiresAt: new Date(Date.now() + SESSION_DURACION_MS),
        userAgent: req.headers['user-agent'],
      },
    });
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLoginAt: new Date() },
    });

    res.cookie(SESSION_COOKIE, token, opcionesCookieSesion());

    return {
      usuario: {
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresaSlug: empresa.slug,
        empresaNombre: empresa.nombre,
        talentoId: usuario.talentoId,
        passwordDebeCambiar: usuario.passwordDebeCambiar,
      },
    };
  }

  async me(usuario: Usuario) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: usuario.empresaId },
      select: { slug: true, nombre: true },
    });
    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        talentoId: usuario.talentoId,
      },
      empresa,
    };
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (token) {
      await this.prisma.sesion.updateMany({
        where: { tokenHash: hashTokenSesion(token) },
        data: { revokedAt: new Date() },
      });
    }
    res.clearCookie(SESSION_COOKIE, {
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/',
    });
    return { ok: true };
  }
}
