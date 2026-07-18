import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type RequestConAuthHeader = {
  headers: Record<string, string | string[] | undefined>;
};

let clienteAnon: SupabaseClient | null = null;
let clienteServiceRole: SupabaseClient | null = null;

/**
 * Cliente con la clave anon — verificar JWTs de sesión (getClaims, sin
 * round-trip de red) y operaciones que la propia clave anon ya autoriza
 * por diseño, como resetPasswordForEmail (cualquiera que sepa un correo
 * puede disparar un "olvidé mi contraseña", con o sin sesión). Nunca usar
 * este cliente para operaciones que sí requieren service_role.
 */
export function obtenerClienteAnon(): SupabaseClient {
  if (!clienteAnon) {
    clienteAnon = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
  }
  return clienteAnon;
}

/**
 * Cliente con la clave service_role — solo para invitar usuarios
 * (AdminService.crearUsuario y el script de migración). Nunca se usa
 * para resolver sesiones de request normales.
 */
export function obtenerClienteServiceRole(): SupabaseClient {
  if (!clienteServiceRole) {
    clienteServiceRole = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return clienteServiceRole;
}

function extraerBearer(req: RequestConAuthHeader): string | null {
  const header = req.headers?.authorization;
  const valor = Array.isArray(header) ? header[0] : header;
  if (!valor?.startsWith('Bearer ')) return null;
  const token = valor.slice('Bearer '.length).trim();
  return token || null;
}

/**
 * Intenta resolver el usuario autenticado a partir del header
 * Authorization: Bearer <token de Supabase>. Devuelve null si no hay
 * token, es inválido/expiró, o el usuario no existe/está inactivo en
 * Neon — nunca lanza, para que los guards decidan qué hacer.
 */
export async function resolverUsuarioPorBearer(
  req: RequestConAuthHeader,
  prisma: PrismaService,
): Promise<Usuario | null> {
  const token = extraerBearer(req);
  if (!token) return null;

  const { data, error } = await obtenerClienteAnon().auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { supabaseUserId: data.claims.sub },
  });
  if (!usuario || !usuario.activo) return null;

  return usuario;
}
