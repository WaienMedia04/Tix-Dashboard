"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Cake, PartyPopper } from "lucide-react";
import { type CumpleanosResponse, fetchCumpleanos } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEsMobile } from "@/lib/use-es-mobile";

const Ballpit = dynamic(() => import("@/components/vendor/Ballpit/Ballpit"), { ssr: false });

const COLORES_GLOBOS = [0xff477e, 0xffd23f, 0x06d6a0, 0x118ab2, 0xef476f, 0xffa62b, 0x9b5de5, 0xf72585];

function mesActualLabel(): string {
  const texto = new Intl.DateTimeFormat("es-DO", { month: "long", timeZone: "America/Santo_Domingo" }).format(
    new Date(),
  );
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function CumpleanosView({ slug }: { slug: string }) {
  const [datos, setDatos] = useState<CumpleanosResponse | null>(null);
  const [error, setError] = useState(false);
  const esMobile = useEsMobile();

  useEffect(() => {
    let cancelado = false;
    fetchCumpleanos(slug)
      .then((d) => {
        if (!cancelado) setDatos(d);
      })
      .catch(() => {
        if (!cancelado) setError(true);
      });
    return () => {
      cancelado = true;
    };
  }, [slug]);

  if (error) {
    return <p className="p-8 text-center text-sm text-destructive">No se pudieron cargar los cumpleaños.</p>;
  }
  if (!datos) {
    return <LoadingScreen />;
  }

  const { hoy, esteMes } = datos;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-8">
      {/* Bloque: cumpleaños de hoy, con fondo de globos (Ballpit) */}
      <section className="dark relative overflow-hidden rounded-2xl border border-border shadow-elegant">
        <div
          className="relative min-h-[22rem] sm:min-h-[26rem]"
          style={{ background: "linear-gradient(160deg, #2a0845 0%, #6441a5 55%, #1b0a33 100%)" }}
        >
          {!esMobile && hoy.length > 0 && (
            <div className="absolute inset-0 z-0">
              <Ballpit count={120} gravity={0.35} friction={0.9925} wallBounce={0.9} followCursor colors={COLORES_GLOBOS} />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center px-4 py-8 text-center">
            <PartyPopper className="h-7 w-7 text-warning" />
            <h1 className="font-display mt-2 text-2xl font-bold text-foreground sm:text-3xl">Cumpleaños de hoy</h1>

            {hoy.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Nadie cumple años hoy — vuelve a revisar mañana.</p>
            ) : (
              <div className="mt-6 flex flex-wrap justify-center gap-6">
                {hoy.map((t) => (
                  <div
                    key={t.id}
                    className="flex w-44 flex-col items-center gap-2 rounded-xl border border-white/15 bg-black/30 p-4 shadow-elegant backdrop-blur-sm"
                  >
                    <Avatar nombreCompleto={t.nombreCompleto} fotoUrl={t.fotoUrl} size="xl" className="ring-4 ring-white/20" />
                    <p className="font-display mt-1 text-base font-semibold text-foreground">{t.nombreCompleto}</p>
                    {t.departamento && <p className="text-xs text-muted-foreground">{t.departamento}</p>}
                    <p className="truncate text-xs text-muted-foreground" title={t.rol}>
                      {t.rol}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bloque: cumpleaños del mes en curso, tarjetas pequeñas, sin fondo especial */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Cake className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Cumpleaños de {mesActualLabel()}</h2>
            <p className="text-xs text-muted-foreground">El resto del mes</p>
          </div>
        </div>

        {esteMes.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No hay más cumpleaños este mes.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {esteMes.map((t) => (
              <div key={t.id} className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-center">
                <Avatar nombreCompleto={t.nombreCompleto} fotoUrl={t.fotoUrl} size="lg" />
                <p className="truncate text-xs font-semibold text-foreground">{t.nombreCompleto}</p>
                {t.departamento && <p className="truncate text-[11px] text-muted-foreground">{t.departamento}</p>}
                <p className="truncate text-[11px] text-muted-foreground" title={t.rol}>
                  {t.rol}
                </p>
                <span className="mt-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  Día {t.dia}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
