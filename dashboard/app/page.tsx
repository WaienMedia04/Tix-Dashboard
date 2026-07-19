"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { me, SesionInvalidaError } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { resolverEstadoMfa } from "@/lib/mfa";
import { BrandMark } from "@/components/BrandMark";
import { Iridescence } from "@/components/Iridescence";
import CurvedInput from "@/components/CurvedInput";

function AccesoInterno() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError =
    searchParams.get("error") === "sesion_invalida"
      ? "Tu sesión ya no es válida. Ingresa de nuevo."
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState<"login" | "recuperar" | "recuperar_enviado">("login");

  async function handleSubmit(valorPassword: string) {
    const emailLimpio = email.trim();
    if (!emailLimpio || !valorPassword || loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email: emailLimpio,
        password: valorPassword,
      });
      if (signInError) {
        setError("Correo o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      const sesion = await me();
      if (!sesion.usuario.passwordEstablecida) {
        router.push("/activar-cuenta");
        return;
      }
      if (!sesion.empresa) {
        setError("Tu usuario no está asociado a ninguna empresa.");
        setLoading(false);
        return;
      }

      const estadoMfa = await resolverEstadoMfa(sesion.usuario.rol);
      if (estadoMfa === "enroll") {
        router.push("/mfa-enroll");
        return;
      }
      if (estadoMfa === "challenge") {
        router.push("/mfa-challenge");
        return;
      }

      router.push(
        sesion.usuario.rol === "TALENTO"
          ? `/${sesion.empresa.slug}/mi-mural`
          : `/${sesion.empresa.slug}/dashboard`,
      );
    } catch (err) {
      if (err instanceof SesionInvalidaError) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
      setLoading(false);
    }
  }

  async function handleRecuperar(correo: string) {
    if (!correo.trim() || loading) return;
    setLoading(true);
    setError(null);
    await getSupabaseBrowserClient().auth.resetPasswordForEmail(correo.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });
    setLoading(false);
    setModo("recuperar_enviado");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0">
        <Iridescence
          color={[0.4392156862745098, 0.3176470588235294, 0.6470588235294118]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      <div className="absolute inset-x-0 top-6 z-10 flex justify-center">
        <BrandMark variant="onDark" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        {modo === "recuperar_enviado" ? (
          <>
            <h1 className="font-sans text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
              Revisa tu correo
            </h1>
            <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              Si el correo existe, te enviamos un link para restablecer tu contraseña.
            </p>
            <button
              onClick={() => setModo("login")}
              className="mt-6 text-sm text-white/75 underline decoration-white/40 underline-offset-4 hover:text-white"
            >
              Volver a ingresar
            </button>
          </>
        ) : (
          <>
            <h1 className="font-sans text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
              {modo === "login" ? "Acceso al panel" : "Recuperar contraseña"}
            </h1>
            <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              {modo === "login"
                ? "Ingresa con tu correo y contraseña."
                : "Escribe tu correo y te enviaremos un link para restablecerla."}
            </p>

            <div className="mt-8 flex w-full flex-col gap-2.5">
              <CurvedInput
                value={email}
                onChange={setEmail}
                onSubmit={modo === "recuperar" ? handleRecuperar : undefined}
                type="email"
                placeholder="Correo electrónico"
                theme="dark"
                showButton={modo === "recuperar"}
                buttonText={loading ? "Enviando..." : "Enviar link"}
                buttonColor="#8B5CF6"
                buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
                width="100%"
                bend={6}
                height={56}
              />
              {modo === "login" && (
                <CurvedInput
                  value={password}
                  onChange={setPassword}
                  onSubmit={handleSubmit}
                  type="password"
                  placeholder="Contraseña"
                  buttonText={loading ? "Verificando..." : "Ingresar"}
                  theme="dark"
                  showIcon={false}
                  buttonColor="#8B5CF6"
                  buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
                  width="100%"
                  bend={6}
                  height={56}
                />
              )}
            </div>

            <button
              onClick={() => setModo(modo === "login" ? "recuperar" : "login")}
              className="mt-4 text-sm text-white/75 underline decoration-white/40 underline-offset-4 hover:text-white"
            >
              {modo === "login" ? "¿Olvidaste tu contraseña?" : "Volver a ingresar"}
            </button>

            {error && <p className="mt-4 text-sm text-rose-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AccesoInterno />
    </Suspense>
  );
}
