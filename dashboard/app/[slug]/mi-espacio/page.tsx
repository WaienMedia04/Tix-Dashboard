"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmpresaNoEncontradaError, SesionInvalidaError, logout, me, type MeResponse } from "@/lib/api";
import { BrandMark } from "@/components/BrandMark";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";

type Estado = { tipo: "cargando" } | { tipo: "error"; mensaje: string } | { tipo: "listo"; sesion: MeResponse };

export default function MiEspacioPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;
    me()
      .then((sesion) => {
        if (cancelado) return;
        if (!sesion.empresa || sesion.empresa.slug !== slug) {
          router.replace("/");
          return;
        }
        // Solo el TALONTO vive aquí; el resto de roles usan el panel completo.
        if (sesion.usuario.rol !== "TALENTO") {
          router.replace(`/${slug}/dashboard`);
          return;
        }
        setEstado({ tipo: "listo", sesion });
      })
      .catch((err) => {
        if (cancelado) return;
        if (err instanceof SesionInvalidaError) {
          router.replace("/");
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

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <BrandMark />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Hola, {estado.sesion.usuario.nombre.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu espacio para registrar bitácoras y ver tu progreso está en construcción.
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
