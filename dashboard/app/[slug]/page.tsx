"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CodigoInvalidoError,
  DashboardData,
  EmpresaNoEncontradaError,
  fetchDashboard,
  storageKey,
} from "@/lib/api";
import { AccessGate } from "@/components/AccessGate";
import { DashboardView } from "@/components/DashboardView";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";

function leerCodigoGuardado(slug: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(storageKey(slug));
}

function DashboardPorEmpresa({ slug }: { slug: string }) {
  const [codigo, setCodigo] = useState<string | null>(() => leerCodigoGuardado(slug));
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) return;
    let cancelado = false;
    fetchDashboard(slug, codigo)
      .then((d) => {
        if (cancelado) return;
        setData(d);
        setError(null);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err instanceof CodigoInvalidoError) {
          sessionStorage.removeItem(storageKey(slug));
          setCodigo(null);
          setGateError("Tu código de acceso ya no es válido. Ingrésalo nuevamente.");
        } else if (err instanceof EmpresaNoEncontradaError) {
          setError(err.message);
        } else {
          setError("No se pudo conectar con el servidor.");
        }
      });
    return () => {
      cancelado = true;
    };
  }, [codigo, slug]);

  function handleLogout() {
    sessionStorage.removeItem(storageKey(slug));
    setCodigo(null);
    setData(null);
  }

  if (!codigo) return <AccessGate slug={slug} initialError={gateError} onUnlock={setCodigo} />;
  if (error) return <ErrorScreen message={error} />;
  if (!data) return <LoadingScreen />;

  return <DashboardView data={data} onLogout={handleLogout} />;
}

export default function EmpresaDashboardPage() {
  const params = useParams<{ slug: string }>();
  return <DashboardPorEmpresa key={params.slug} slug={params.slug} />;
}
