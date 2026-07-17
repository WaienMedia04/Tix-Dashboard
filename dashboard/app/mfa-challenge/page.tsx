"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Factor } from "@supabase/supabase-js";
import { me } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { BrandMark } from "@/components/BrandMark";
import { Iridescence } from "@/components/Iridescence";
import CurvedInput from "@/components/CurvedInput";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function MfaChallengePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function iniciar() {
      const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }

      const { data, error: listError } = await getSupabaseBrowserClient().auth.mfa.listFactors();
      const factor = data?.totp.find((f: Factor) => f.status === "verified");
      if (cancelado) return;
      if (listError || !factor) {
        // No debería pasar (solo se llega aquí cuando ya hay un factor verificado).
        router.replace("/mfa-enroll");
        return;
      }
      setFactorId(factor.id);
      setCargando(false);
    }
    void iniciar();
    return () => {
      cancelado = true;
    };
  }, [router]);

  async function handleVerificar(valorCodigo: string) {
    if (!factorId || !valorCodigo || verificando) return;
    setError(null);
    setVerificando(true);

    const { error: verifyError } = await getSupabaseBrowserClient().auth.mfa.challengeAndVerify({
      factorId,
      code: valorCodigo,
    });
    if (verifyError) {
      setError("Código incorrecto. Intenta de nuevo.");
      setVerificando(false);
      return;
    }

    const sesion = await me();
    if (!sesion.empresa) {
      setError("Tu usuario no está asociado a ninguna empresa.");
      setVerificando(false);
      return;
    }
    router.push(`/${sesion.empresa.slug}/dashboard`);
  }

  if (cargando) return <LoadingScreen />;

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
          Verificación en dos pasos
        </h1>
        <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          Ingresa el código de tu app de autenticación.
        </p>

        <div className="mt-8 w-full">
          <CurvedInput
            value={codigo}
            onChange={setCodigo}
            onSubmit={handleVerificar}
            type="text"
            placeholder="Código de 6 dígitos"
            buttonText={verificando ? "Verificando..." : "Ingresar"}
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
