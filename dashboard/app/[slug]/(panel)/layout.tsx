"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  DashboardData,
  EmpresaNoEncontradaError,
  SesionInvalidaError,
  fetchDashboard,
  me,
  type Rol,
} from "@/lib/api";
import { Sidebar } from "@/components/panel/Sidebar";
import { Header } from "@/components/panel/Header";
import { PanelProvider } from "@/components/panel/PanelContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | {
      tipo: "listo";
      data: DashboardData;
      rol: Rol;
      usuarioId: string;
      usuarioNombre: string;
    };

function PanelInterno({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const sesion = await me();
        if (!sesion.empresa || sesion.empresa.slug !== slug) {
          if (!cancelado) router.replace("/");
          return;
        }
        // Un TALENTO no usa el panel completo — su vista vive en /mi-espacio.
        if (sesion.usuario.rol === "TALENTO" && !pathname.startsWith(`/${slug}/mi-espacio`)) {
          if (!cancelado) router.replace(`/${slug}/mi-espacio`);
          return;
        }
        const data = await fetchDashboard(slug);
        if (!cancelado) {
          setEstado({
            tipo: "listo",
            data,
            rol: sesion.usuario.rol,
            usuarioId: sesion.usuario.id,
            usuarioNombre: sesion.usuario.nombre,
          });
        }
      } catch (err) {
        if (cancelado) return;
        if (err instanceof SesionInvalidaError) {
          router.replace("/");
        } else if (err instanceof EmpresaNoEncontradaError) {
          setEstado({ tipo: "error", mensaje: err.message });
        } else {
          setEstado({ tipo: "error", mensaje: "No se pudo conectar con el servidor." });
        }
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, [slug, pathname, router]);

  if (estado.tipo === "cargando") return <LoadingScreen />;
  if (estado.tipo === "error") return <ErrorScreen message={estado.mensaje} />;

  return (
    <PanelProvider
      value={{
        slug,
        rol: estado.rol,
        usuarioId: estado.usuarioId,
        usuarioNombre: estado.usuarioNombre,
        empresa: estado.data.empresa,
        dashboardInicial: estado.data,
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-background print:h-auto print:w-auto print:overflow-visible">
        <Sidebar slug={slug} empresaNombre={estado.data.empresa.nombre} rol={estado.rol} />
        <div className="flex min-w-0 flex-1 flex-col print:overflow-visible">
          <Header empresaNombre={estado.data.empresa.nombre} plan={estado.data.empresa.plan} />
          <main className="bg-page-backdrop flex-1 overflow-y-auto px-6 py-5 print:overflow-visible print:bg-transparent print:p-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
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
