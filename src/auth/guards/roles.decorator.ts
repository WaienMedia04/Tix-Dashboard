import { SetMetadata } from '@nestjs/common';
import { Rol } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restringe un endpoint a ciertos roles humanos. El tráfico de servicio
 * (ClawLink, vía codigoAcceso) siempre pasa — nunca tuvo rol y no debe
 * empezar a requerir uno ahora.
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
