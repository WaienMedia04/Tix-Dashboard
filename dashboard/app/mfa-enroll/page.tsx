"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { me, SesionInvalidaError } from "@/lib/api";
import { BrandMark } from "@/components/BrandMark";
import { Iridescence } from "@/components/Iridescence";
import CurvedInput from "@/components/CurvedInput";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function MfaEnrollPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [secreto, setSecreto] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preparando, setPreparando] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (user.twoFactorEnabled) {
      irAlDestino();
      return;
    }
    user
      .createTOTP()
      .then((totp) => {
        setSecreto(totp.secret ?? null);
        setPreparando(false);
      })
      .catch(() => {
        setError("No se pudo iniciar la configuración de verificación en dos pasos.");
        setPreparando(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  async function irAlDestino() {
    try {
      const sesion = await me();
      if (!sesion.empresa) {
        router.push("/");
        return;
      }
      router.push(
        sesion.usuario.rol === "TALENTO" ? `/${sesion.empresa.slug}/mi-espacio` : `/${sesion.empresa.slug}/dashboard`,
      );
    } catch (err) {
      if (err instanceof SesionInvalidaError) router.push("/");
    }
  }

  async function handleVerificar(codigoIngresado: string) {
    if (!user || !codigoIngresado || loading) return;
    setError(null);
    setLoading(true);
    try {
      await user.verifyTOTP({ code: codigoIngresado });
      await irAlDestino();
    } catch {
      setError("Código incorrecto. Verifica que tu app autenticadora esté sincronizada.");
      setLoading(false);
    }
  }

  if (!isLoaded || preparando) return <LoadingScreen />;

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
          Tu rol requiere activar esto antes de continuar.
        </p>

        {secreto && (
          <div className="mt-6 w-full rounded-xl border border-white/15 bg-black/30 p-4 text-left">
            <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">
              1. Agrega esta clave a tu app autenticadora
            </p>
            <p className="mt-1 text-sm break-all text-white/90">
              (Google Authenticator, Authy, 1Password, etc. — opción &quot;ingresar clave manualmente&quot;)
            </p>
            <p className="mt-2 rounded-md bg-black/40 px-3 py-2 font-mono text-sm break-all text-emerald-300">
              {secreto}
            </p>
          </div>
        )}

        <p className="mt-6 text-xs font-semibold tracking-wide text-white/70 uppercase">
          2. Ingresa el código de 6 dígitos generado
        </p>
        <div className="mt-3 flex w-full flex-col gap-2.5">
          <CurvedInput
            value={codigo}
            onChange={setCodigo}
            onSubmit={handleVerificar}
            type="text"
            placeholder="Código de 6 dígitos"
            buttonText={loading ? "Verificando..." : "Activar"}
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
