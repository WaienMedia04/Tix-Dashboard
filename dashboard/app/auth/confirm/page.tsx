"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { LoadingScreen } from "@/components/LoadingScreen";
import type { EmailOtpType } from "@supabase/supabase-js";

// Resuelve el link de invitación (CEO/RRHH invita a un talento) o de
// recuperación de contraseña que Supabase manda por correo. Soporta dos
// formatos, porque cuál usa Supabase depende de la plantilla de correo:
//  - Plantilla por defecto (sin SMTP propio configurado): el link pasa por
//    el endpoint de verificación propio de Supabase, que redirige acá con
//    la sesión en el FRAGMENTO de la URL (#access_token=...) — un fragmento
//    nunca llega al servidor, así que esto se resuelve solo en el navegador.
//  - Plantilla personalizada (con SMTP propio, apuntando directo acá con
//    ?token_hash=...&type=...): se resuelve con verifyOtp().
export default function ConfirmarInvitacionPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelado = false;

    async function resolver() {
      const supabase = getSupabaseBrowserClient();

      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (cancelado) return;
        router.replace(error ? "/?error=sesion_invalida" : "/activar-cuenta");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type") as EmailOtpType | null;

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (cancelado) return;
        router.replace(error ? "/?error=sesion_invalida" : "/activar-cuenta");
        return;
      }

      router.replace("/?error=sesion_invalida");
    }

    void resolver();
    return () => {
      cancelado = true;
    };
  }, [router]);

  return <LoadingScreen />;
}
