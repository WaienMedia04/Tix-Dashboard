"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DemasiadosIntentosError, SesionInvalidaError, login } from "@/lib/api";
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

  async function handleSubmit(valorPassword: string) {
    const emailLimpio = email.trim();
    if (!emailLimpio || !valorPassword || loading) return;
    setError(null);
    setLoading(true);
    try {
      const { usuario } = await login(emailLimpio, valorPassword);
      router.push(
        usuario.rol === "TALENTO" ? `/${usuario.empresaSlug}/mi-espacio` : `/${usuario.empresaSlug}/dashboard`,
      );
    } catch (err) {
      if (err instanceof SesionInvalidaError) {
        setError("Correo o contraseña incorrectos.");
      } else if (err instanceof DemasiadosIntentosError) {
        setError(err.message);
      } else {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
      setLoading(false);
    }
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
          Acceso al panel
        </h1>
        <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          Ingresa con tu correo y contraseña.
        </p>

        <div className="mt-9 flex w-full flex-col gap-4">
          <CurvedInput
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="Correo electrónico"
            theme="dark"
            showButton={false}
            width="100%"
            bend={16}
            height={58}
          />
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
            bend={16}
            height={58}
          />
        </div>

        {error && <p className="mt-4 text-sm text-rose-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">{error}</p>}
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
