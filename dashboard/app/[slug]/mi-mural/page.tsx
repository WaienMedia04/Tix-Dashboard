"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import { EmpresaNoEncontradaError, SesionInvalidaError, me } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";
import { MiMuralView } from "@/components/mural/MiMuralView";
import { BarraSuperiorMural } from "@/components/mural/BarraSuperiorMural";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "sin-talento" }
  | { tipo: "listo"; talentoId: string; rol: string; nombre: string; fotoUrl: string | null };

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
        setEstado({
          tipo: "listo",
          talentoId: sesion.usuario.talentoId,
          rol: sesion.usuario.rol,
          nombre: sesion.usuario.nombre,
          fotoUrl: sesion.usuario.fotoUrl,
        });
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

  const volver = estado.tipo === "listo" && estado.rol !== "TALENTO" ? `/${slug}/dashboard` : `/${slug}/mi-espacio`;
  const volverLabel = estado.tipo === "listo" && estado.rol !== "TALENTO" ? "Volver al panel" : "Volver a mi espacio";

  return (
    <div className="min-h-screen bg-background">
      <BarraSuperiorMural
        slug={slug}
        volver={volver}
        volverLabel={volverLabel}
        nombre={estado.tipo === "listo" ? estado.nombre : ""}
        fotoUrl={estado.tipo === "listo" ? estado.fotoUrl : null}
      />

      {estado.tipo === "sin-talento" ? (
        <div className="flex min-h-[calc(100vh-40px)] items-center justify-center px-4">
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
    </div>
  );
}
