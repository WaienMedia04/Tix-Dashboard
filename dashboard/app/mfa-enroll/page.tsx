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

export default function MfaEnrollPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
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

      // Si ya hay un factor TOTP sin verificar de un intento anterior, lo
      // reutilizamos en vez de acumular factores huérfanos.
      const { data: factores } = await getSupabaseBrowserClient().auth.mfa.listFactors();
      const existente = factores?.all.find(
        (f: Factor) => f.factor_type === "totp" && f.status === "unverified",
      );
      if (existente) {
        await getSupabaseBrowserClient().auth.mfa.unenroll({ factorId: existente.id });
      }

      const { data, error: enrollError } = await getSupabaseBrowserClient().auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "TalentiX",
      });
      if (cancelado) return;
      if (enrollError || !data) {
        setError("No se pudo iniciar la configuración de 2FA. Intenta de nuevo.");
        setCargando(false);
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
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
      setError("Código incorrecto. Verifica la hora de tu dispositivo e intenta de nuevo.");
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
          Activa la verificación en dos pasos
        </h1>
        <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          Es obligatoria para tu rol. Escanea el código con tu app de autenticación (Google Authenticator, Authy, etc).
        </p>

        {cargando ? (
          <div className="mt-8">
            <LoadingScreen />
          </div>
        ) : qrCode ? (
          <>
            <div className="mt-6 rounded-xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCode}
                alt="Código QR para configurar la verificación en dos pasos"
                width={200}
                height={200}
              />
            </div>
            {secret && (
              <p className="mt-3 break-all font-mono text-xs text-white/60">
                ¿No puedes escanear? Ingresa este código manualmente: {secret}
              </p>
            )}

            <div className="mt-6 w-full">
              <CurvedInput
                value={codigo}
                onChange={setCodigo}
                onSubmit={handleVerificar}
                type="text"
                placeholder="Código de 6 dígitos"
                buttonText={verificando ? "Verificando..." : "Confirmar"}
                theme="dark"
                showIcon={false}
                buttonColor="#8B5CF6"
                buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
                width="100%"
                bend={6}
                height={56}
              />
            </div>
          </>
        ) : null}

        {error && <p className="mt-4 text-sm text-rose-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">{error}</p>}
      </div>
    </div>
  );
}
