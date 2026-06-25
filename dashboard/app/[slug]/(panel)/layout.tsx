"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CodigoInvalidoError,
  DashboardData,
  EmpresaNoEncontradaError,
  fetchDashboard,
} from "@/lib/api";
import { borrarCodigo, leerCodigoGuardado } from "@/lib/auth";
import { Sidebar } from "@/components/panel/Sidebar";
import { Header } from "@/components/panel/Header";
import { PanelProvider } from "@/components/panel/PanelContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; data: DashboardData; codigo: string };

function PanelInterno({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    const codigo = leerCodigoGuardado(slug);
    if (!codigo) {
      router.replace(`/${slug}`);
      return;
    }
    let cancelado = false;
    fetchDashboard(slug, codigo)
      .then((data) => {
        if (!cancelado) setEstado({ tipo: "listo", data, codigo });
      })
      .catch((err) => {
        if (cancelado) return;
        if (err instanceof CodigoInvalidoError) {
          borrarCodigo(slug);
          router.replace(`/${slug}?error=codigo_invalido`);
        } else if (err instanceof EmpresaNoEncontradaError) {
          setEstado({ tipo: "error", mensaje: err.message });
        } else {
          setEstado({ tipo: "error", mensaje: "No se pudo conectar con el servidor." });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [slug, router]);

  if (estado.tipo === "cargando") return <LoadingScreen />;
  if (estado.tipo === "error") return <ErrorScreen message={estado.mensaje} />;

  return (
    <PanelProvider
      value={{
        slug,
        codigoAcceso: estado.codigo,
        empresa: estado.data.empresa,
        dashboardInicial: estado.data,
      }}
    >
      <div className="min-h-screen bg-background">
        <Sidebar slug={slug} empresaNombre={estado.data.empresa.nombre} />
        <div className="flex min-h-screen flex-col pl-60 print:pl-0">
          <Header empresaNombre={estado.data.empresa.nombre} plan={estado.data.empresa.plan} />
          <main className="flex-1 px-6 py-5 print:p-0">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </PanelProvider>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  return (
    <PanelInterno key={params.slug} slug={params.slug}>
      {children}
    </PanelInterno>
  );
}
