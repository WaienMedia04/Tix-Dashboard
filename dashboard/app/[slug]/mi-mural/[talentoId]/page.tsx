"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmpresaNoEncontradaError, SesionInvalidaError, me } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";
import { MiMuralView } from "@/components/mural/MiMuralView";
import { BarraSuperiorMural } from "@/components/mural/BarraSuperiorMural";
import { ChatFlotante } from "@/components/chat/ChatFlotante";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; miTalentoId: string; rol: string; nombre: string; fotoUrl: string | null };

export default function MuralDeCompaneroPage() {
  const { slug, talentoId } = useParams<{ slug: string; talentoId: string }>();
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
        // Ver el propio mural "ajeno" no tiene sentido — la versión editable
        // ya vive en /mi-mural.
        if (sesion.usuario.talentoId === talentoId) {
          router.replace(`/${slug}/mi-mural`);
          return;
        }
        setEstado({
          tipo: "listo",
          miTalentoId: sesion.usuario.talentoId ?? "",
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
  }, [slug, talentoId, router]);

  if (estado.tipo === "cargando") return <LoadingScreen />;
  if (estado.tipo === "error") return <ErrorScreen message={estado.mensaje} />;

  const volver = estado.rol !== "TALENTO" ? `/${slug}/dashboard` : `/${slug}/mi-espacio`;
  const volverLabel = estado.rol !== "TALENTO" ? "Volver al panel" : "Volver a mi espacio";

  return (
    <div className="min-h-screen bg-background">
      <BarraSuperiorMural
        slug={slug}
        volver={volver}
        volverLabel={volverLabel}
        nombre={estado.nombre}
        fotoUrl={estado.fotoUrl}
      />

      <MiMuralView slug={slug} talentoId={talentoId} miTalentoId={estado.miTalentoId} rol={estado.rol} />
      <ChatFlotante slug={slug} />
    </div>
  );
}
