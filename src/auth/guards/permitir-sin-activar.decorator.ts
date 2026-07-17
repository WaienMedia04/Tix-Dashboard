import { SetMetadata } from '@nestjs/common';

export const PERMITIR_SIN_ACTIVAR_KEY = 'permitirSinActivar';

/**
 * Marca un endpoint como accesible aunque el usuario todavía tenga
 * passwordEstablecida === false (Supabase ya le abrió sesión desde el link
 * de invitación, pero aún no fijó su propia contraseña). Solo debe usarse
 * en los endpoints que la propia activación necesita: GET /auth/me y
 * POST /auth/activar.
 */
export const PermitirSinActivar = () =>
  SetMetadata(PERMITIR_SIN_ACTIVAR_KEY, true);
