"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { activarCuenta, me } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { BrandMark } from "@/components/BrandMark";
import { Iridescence } from "@/components/Iridescence";
import CurvedInput from "@/components/CurvedInput";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function ActivarCuentaPage() {
  const router = useRouter();
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function verificar() {
      const {
        data: { session },
      } = await getSupabaseBrowserClient().auth.getSession();
      if (cancelado) return;
      if (!session) {
        router.replace("/");
        return;
      }
      setVerificandoSesion(false);
    }
    void verificar();
    return () => {
      cancelado = true;
    };
  }, [router]);

  async function handleSubmit() {
    if (!password || loading) return;
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError(null);
    setLoading(true);

    const { error: updateError } = await getSupabaseBrowserClient().auth.updateUser({ password });
    if (updateError) {
      setError("No se pudo establecer la contraseña. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    try {
      await activarCuenta();
      const sesion = await me();
      if (!sesion.empresa) {
        setError("Tu usuario no está asociado a ninguna empresa.");
        setLoading(false);
        return;
      }
      router.push(
        sesion.usuario.rol === "TALENTO"
          ? `/${sesion.empresa.slug}/mi-mural`
          : `/${sesion.empresa.slug}/dashboard`,
      );
    } catch {
      setError("Contraseña establecida, pero no se pudo activar la cuenta. Intenta ingresar de nuevo.");
      setLoading(false);
    }
  }

  if (verificandoSesion) return <LoadingScreen />;

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
        <h1 className="font-sans text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
          Activa tu cuenta
        </h1>
        <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          Crea tu contraseña para entrar a la plataforma.
        </p>

        <div className="mt-8 flex w-full flex-col gap-2.5">
          <CurvedInput
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Nueva contraseña"
            theme="dark"
            showButton={false}
            showIcon={false}
            width="100%"
            bend={6}
            height={56}
          />
          <CurvedInput
            value={confirmacion}
            onChange={setConfirmacion}
            onSubmit={handleSubmit}
            type="password"
            placeholder="Confirmar contraseña"
            buttonText={loading ? "Guardando..." : "Activar"}
            theme="dark"
            showIcon={false}
            buttonColor="#8B5CF6"
            buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
            width="100%"
            bend={6}
            height={56}
          />
        </div>

        {error && <p className="mt-4 text-sm text-rose-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">{error}</p>}
      </div>
    </div>
  );
}
