"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { EmpresaNoEncontradaError, SesionInvalidaError, me } from "@/lib/api";
import { BrandMark } from "@/components/BrandMark";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";
import { CumpleanosView } from "@/components/cumpleanos/CumpleanosView";
import { ChatFlotante } from "@/components/chat/ChatFlotante";

type Estado = { tipo: "cargando" } | { tipo: "error"; mensaje: string } | { tipo: "listo"; rol: string };

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

export default function CumpleanosPage() {
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
        setEstado({ tipo: "listo", rol: sesion.usuario.rol });
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

  const volver = estado.rol !== "TALENTO" ? `/${slug}/dashboard` : `/${slug}/mi-espacio`;

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-safe flex min-h-16 items-center justify-between border-b border-border px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href={volver}
            aria-label="Volver"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <BrandMark />
        </div>
        <ThemeToggle />
      </header>

      <CumpleanosView slug={slug} />
      <ChatFlotante slug={slug} />
    </div>
  );
}
