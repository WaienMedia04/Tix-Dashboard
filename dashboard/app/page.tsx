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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const { slug } = await validarCodigoAcceso(codigo.trim());
      guardarCodigo(slug, codigo.trim());
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-card">
        <div className="mb-6 text-center">
          <BrandMark />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Acceso al panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ingresa el código de acceso de tu empresa.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código de acceso"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading || !codigo.trim()}
            className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
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
