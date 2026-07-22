"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  DashboardData,
  EmpresaDisponible,
  EmpresaNoEncontradaError,
  SesionInvalidaError,
  fetchDashboard,
  me,
  type Rol,
} from "@/lib/api";
import { resolverEstadoMfa } from "@/lib/mfa";
import { Sidebar } from "@/components/panel/Sidebar";
import { Header } from "@/components/panel/Header";
import { PanelProvider } from "@/components/panel/PanelContext";
import { PanelDock } from "@/components/panel/PanelDock";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";
import { ChatFlotante } from "@/components/chat/ChatFlotante";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | {
      tipo: "listo";
      data: DashboardData;
      rol: Rol;
      usuarioId: string;
      usuarioNombre: string;
      usuarioEmail: string;
      usuarioFotoUrl: string | null;
      departamentosSupervisados: string[];
      empresasDisponibles: EmpresaDisponible[];
    };

function PanelInterno({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Cierra el drawer si la ruta cambia por fuera de un tap en el propio
  // menú (ej. gesto de atrás/adelante del navegador).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuMovilAbierto(false);
  }, [pathname]);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const sesion = await me();
        // Sucursales: el slug activo puede ser la empresa "casa" del usuario
        // o cualquier otra a la que tenga acceso vinculado — nunca solo la casa.
        if (!sesion.empresasDisponibles.some((e) => e.slug === slug)) {
          if (!cancelado) router.replace("/");
          return;
        }
        if (!sesion.usuario.passwordEstablecida) {
          if (!cancelado) router.replace("/activar-cuenta");
          return;
        }
        const estadoMfa = await resolverEstadoMfa(sesion.usuario.rol);
        if (estadoMfa !== "ok") {
          if (!cancelado) router.replace(estadoMfa === "enroll" ? "/mfa-enroll" : "/mfa-challenge");
          return;
        }
        // Un TALENTO no usa el panel completo — su vista vive fuera de este layout.
        if (sesion.usuario.rol === "TALENTO" && !pathname.startsWith(`/${slug}/mi-espacio`)) {
          if (!cancelado) router.replace(`/${slug}/mi-mural`);
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
            usuarioEmail: sesion.usuario.email,
            usuarioFotoUrl: sesion.usuario.fotoUrl,
            departamentosSupervisados: sesion.usuario.departamentosSupervisados,
            empresasDisponibles: sesion.empresasDisponibles,
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
        usuarioEmail: estado.usuarioEmail,
        usuarioFotoUrl: estado.usuarioFotoUrl,
        departamentosSupervisados: estado.departamentosSupervisados,
        empresasDisponibles: estado.empresasDisponibles,
        empresa: estado.data.empresa,
        dashboardInicial: estado.data,
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-background print:h-auto print:w-auto print:overflow-visible">
        <Sidebar
          slug={slug}
          empresaNombre={estado.data.empresa.nombre}
          rol={estado.rol}
          abierto={menuMovilAbierto}
          onCerrar={() => setMenuMovilAbierto(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col print:overflow-visible">
          <Header
            empresaNombre={estado.data.empresa.nombre}
            plan={estado.data.empresa.plan}
            onAbrirMenu={() => setMenuMovilAbierto(true)}
          />
          <main className="bg-page-backdrop flex-1 overflow-y-auto px-4 py-4 pb-24 sm:px-6 sm:py-5 sm:pb-28 print:overflow-visible print:bg-transparent print:p-0">
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
        <PanelDock />
        <ChatFlotante slug={slug} />
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
