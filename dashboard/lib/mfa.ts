import { getSupabaseBrowserClient } from "./supabase-browser";
import type { Rol } from "./api";

export type EstadoMfa = "ok" | "enroll" | "challenge";

const ROLES_CON_MFA_OBLIGATORIO: Rol[] = ["CEO", "RRHH"];

/**
 * Determina si la sesión actual necesita pasar por /mfa-enroll (todavía no
 * tiene un factor TOTP verificado) o /mfa-challenge (ya tiene uno, pero esta
 * sesión concreta no completó el desafío aal2) antes de entrar al panel.
 * Solo aplica a CEO/RRHH — el resto de roles nunca lo requieren.
 */
export async function resolverEstadoMfa(rol: Rol): Promise<EstadoMfa> {
  if (!ROLES_CON_MFA_OBLIGATORIO.includes(rol)) return "ok";

  const { data, error } = await getSupabaseBrowserClient().auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return "ok";

  if (data.currentLevel === "aal2") return "ok";
  if (data.nextLevel === "aal2") return "challenge";
  return "enroll";
}
