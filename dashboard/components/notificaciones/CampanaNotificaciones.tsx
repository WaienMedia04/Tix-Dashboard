"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Cake, CalendarClock, FileText, Gift, Megaphone, StickyNote } from "lucide-react";
import {
  fetchContadorNotificaciones,
  fetchNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  type Notificacion,
  type TipoNotificacion,
} from "@/lib/api";

const INTERVALO_CONTADOR_MS = 45_000;

const ICONO_POR_TIPO: Record<TipoNotificacion, { Icon: typeof Bell; color: string }> = {
  ESTAMPA_RECIBIDA: { Icon: Gift, color: "text-fuchsia-400" },
  CUMPLEANOS: { Icon: Cake, color: "text-rose-400" },
  AUSENCIA_REGISTRADA: { Icon: CalendarClock, color: "text-amber-400" },
  NOVEDAD_PUBLICADA: { Icon: Megaphone, color: "text-sky-400" },
  CV_LISTO_PARA_REVISAR: { Icon: FileText, color: "text-emerald-400" },
  NOTA_RECIBIDA: { Icon: StickyNote, color: "text-yellow-400" },
};

function tiempoRelativo(iso: string): string {
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (segundos < 60) return "ahora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} d`;
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "short" });
}

export function CampanaNotificaciones({ slug }: { slug: string }) {
  const router = useRouter();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [contador, setContador] = useState(0);
  const [notificaciones, setNotificaciones] = useState<Notificacion[] | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    function cargarContador() {
      fetchContadorNotificaciones(slug)
        .then((r) => {
          if (!cancelado) setContador(r.noLeidas);
        })
        .catch(() => {});
    }
    cargarContador();
    const id = setInterval(cargarContador, INTERVALO_CONTADOR_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [slug]);

  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickFuera);
      document.removeEventListener("keydown", onEscape);
    };
  }, [abierto]);

  function alternar() {
    const siguiente = !abierto;
    setAbierto(siguiente);
    if (siguiente && notificaciones === null) {
      setCargando(true);
      fetchNotificaciones(slug)
        .then(setNotificaciones)
        .catch(() => setNotificaciones([]))
        .finally(() => setCargando(false));
    }
  }

  async function handleClickNotificacion(n: Notificacion) {
    if (!n.leida) {
      setNotificaciones((prev) => prev?.map((x) => (x.id === n.id ? { ...x, leida: true } : x)) ?? prev);
      setContador((c) => Math.max(0, c - 1));
      marcarNotificacionLeida(slug, n.id).catch(() => {});
    }
    if (n.enlace) {
      setAbierto(false);
      router.push(`/${slug}${n.enlace}`);
    }
  }

  async function handleMarcarTodas() {
    setNotificaciones((prev) => prev?.map((x) => ({ ...x, leida: true })) ?? prev);
    setContador(0);
    marcarTodasNotificacionesLeidas(slug).catch(() => {});
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        onClick={alternar}
        aria-label="Notificaciones"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4.5 w-4.5" />
        {contador > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
            {contador > 9 ? "9+" : contador}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute top-full right-0 z-20 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-md border border-border bg-popover shadow-elegant">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">Notificaciones</p>
            {contador > 0 && (
              <button
                onClick={() => void handleMarcarTodas()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando && <div className="h-24 animate-pulse" />}

            {!cargando && notificaciones !== null && notificaciones.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No tienes notificaciones.</p>
            )}

            {!cargando &&
              notificaciones !== null &&
              notificaciones.map((n) => {
                const { Icon, color } = ICONO_POR_TIPO[n.tipo] ?? { Icon: Bell, color: "text-muted-foreground" };
                return (
                  <button
                    key={n.id}
                    onClick={() => void handleClickNotificacion(n)}
                    className={`flex w-full items-start gap-2.5 border-b border-border px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-accent ${
                      n.leida ? "" : "bg-accent/40"
                    }`}
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{n.titulo}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.mensaje}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{tiempoRelativo(n.createdAt)}</p>
                    </div>
                    {!n.leida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
