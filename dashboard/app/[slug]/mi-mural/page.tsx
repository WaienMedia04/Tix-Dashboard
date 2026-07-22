"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronLeft, Moon, Sun, UserX } from "lucide-react";
import { EmpresaNoEncontradaError, SesionInvalidaError, me } from "@/lib/api";
import { BrandMark } from "@/components/BrandMark";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";
import { MiMuralView } from "@/components/mural/MiMuralView";
import { ChatFlotante } from "@/components/chat/ChatFlotante";
import { CampanaNotificaciones } from "@/components/notificaciones/CampanaNotificaciones";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "sin-talento" }
  | { tipo: "listo"; talentoId: string; rol: string };

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), []);
  const esOscuro = montado && resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(esOscuro ? "light" : "dark")}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
    >
      {esOscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function MiMuralPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const sesion = await me();
        if (cancelado) return;
        if (!sesion.empresa || sesion.empresa.slug !== slug) {
          router.replace("/");
          return;
        }
        if (!sesion.usuario.passwordEstablecida) {
          router.replace("/activar-cuenta");
          return;
        }
        if (!sesion.usuario.talentoId) {
          setEstado({ tipo: "sin-talento" });
          return;
        }
        setEstado({ tipo: "listo", talentoId: sesion.usuario.talentoId, rol: sesion.usuario.rol });
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
  }, [slug, router]);

  if (estado.tipo === "cargando") return <LoadingScreen />;
  if (estado.tipo === "error") return <ErrorScreen message={estado.mensaje} />;

  const volver = () => (estado.tipo === "listo" && estado.rol !== "TALENTO" ? `/${slug}/dashboard` : `/${slug}/mi-espacio`);

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-safe flex min-h-16 items-center justify-between border-b border-border px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href={volver()}
            aria-label="Volver"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <BrandMark />
        </div>
        <div className="flex items-center gap-2">
          <CampanaNotificaciones slug={slug} />
          <ThemeToggle />
        </div>
      </header>

      {estado.tipo === "sin-talento" ? (
        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4">
          <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center shadow-card">
            <UserX className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-foreground">
              Tu cuenta no tiene un perfil de empleado asociado, así que no tiene un Mi Mural propio.
            </p>
          </div>
        </div>
      ) : (
        <MiMuralView slug={slug} miTalentoId={estado.talentoId} rol={estado.rol} />
      )}
      <ChatFlotante slug={slug} />
    </div>
  );
}
