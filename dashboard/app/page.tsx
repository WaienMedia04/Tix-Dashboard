"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CodigoInvalidoError,
  DemasiadosIntentosError,
  validarCodigoAcceso,
} from "@/lib/api";
import { guardarCodigo } from "@/lib/auth";
import { BrandMark } from "@/components/BrandMark";
import { Iridescence } from "@/components/Iridescence";
import CurvedInput from "@/components/CurvedInput";

function AccesoInterno() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError =
    searchParams.get("error") === "codigo_invalido"
      ? "Tu código de acceso ya no es válido. Ingrésalo nuevamente."
      : null;

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(valor: string) {
    const codigoLimpio = valor.trim();
    if (!codigoLimpio || loading) return;
    setError(null);
    setLoading(true);
    try {
      const { slug } = await validarCodigoAcceso(codigoLimpio);
      guardarCodigo(slug, codigoLimpio);
      router.push(`/${slug}/dashboard`);
    } catch (err) {
      if (err instanceof CodigoInvalidoError) {
        setError("Código de acceso incorrecto.");
      } else if (err instanceof DemasiadosIntentosError) {
        setError(err.message);
      } else {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
    } finally {
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
        <h1 className="text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
          Acceso al panel
        </h1>
        <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          Ingresa el código de acceso de tu empresa.
        </p>

        <div className="mt-9 w-full">
          <CurvedInput
            value={codigo}
            onChange={setCodigo}
            onSubmit={handleSubmit}
            type="password"
            placeholder="Código de acceso"
            buttonText={loading ? "Verificando..." : "Ingresar"}
            theme="dark"
            showIcon={false}
            buttonColor="#8B5CF6"
            buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
            width="100%"
            bend={28}
            height={64}
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
