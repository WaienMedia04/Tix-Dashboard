export {};

/**
 * Acceso al singleton global que Clerk expone en window — patrón oficial
 * para leer el token de sesión fuera de un componente React (ver
 * dashboard/lib/api.ts). Solo se tipan los campos que este proyecto usa.
 */
declare global {
  interface Window {
    Clerk?: {
      session?: { getToken(): Promise<string | null> } | null;
      user?: { twoFactorEnabled: boolean } | null;
    };
  }
}
