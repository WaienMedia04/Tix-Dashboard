"use client";

import { useEffect, useState } from "react";
import { Calendar, Newspaper, Sparkles } from "lucide-react";
import { type BoletinItem, type TipoBoletin, fetchBoletin } from "@/lib/api";

const INTERVALO_POLLING_MS = 60_000;

const META_TIPO: Record<TipoBoletin, { label: string; icon: typeof Newspaper; texto: string; fondo: string }> = {
  NOTICIA: { label: "Noticia", icon: Newspaper, texto: "text-blue-600", fondo: "bg-blue-50" },
  EVENTO: { label: "Evento", icon: Calendar, texto: "text-amber-600", fondo: "bg-amber-50" },
  BLOG: { label: "Blog", icon: Sparkles, texto: "text-primary", fondo: "bg-primary/10" },
};

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
}

function TarjetaBoletin({ item }: { item: BoletinItem }) {
  const [expandido, setExpandido] = useState(false);
  const meta = META_TIPO[item.tipo];
  const esLargo = item.contenido.length > 220;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.fondo} ${meta.texto}`}>
          <meta.icon className="h-3 w-3" />
          {meta.label}
        </span>
        <span className="text-[11px] text-zinc-400">
          {item.tipo === "EVENTO" && item.fechaEvento ? formatearFecha(item.fechaEvento) : formatearFecha(item.createdAt)}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-zinc-900">{item.titulo}</p>
      <p className={`mt-1 text-sm whitespace-pre-wrap text-zinc-700 ${expandido ? "" : "line-clamp-3"}`}>{item.contenido}</p>
      {esLargo && (
        <button
          onClick={() => setExpandido((v) => !v)}
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          {expandido ? "Ver menos" : "Leer más"}
        </button>
      )}
      <p className="mt-1.5 text-[11px] text-zinc-400">Por {item.autorNombre}</p>
    </div>
  );
}

/** Mural informativo de solo lectura — noticias/eventos/blog que publica CEO/RRHH, visible para toda la empresa. */
export function BoletinInformativo({ slug }: { slug: string }) {
  const [items, setItems] = useState<BoletinItem[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    function cargar() {
      fetchBoletin(slug)
        .then((r) => {
          if (!cancelado) setItems(r.data);
        })
        .catch(() => {
          if (!cancelado) setItems((prev) => prev ?? []);
        });
    }
    cargar();
    const id = setInterval(cargar, INTERVALO_POLLING_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [slug]);

  return (
    <div className="w-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 lg:max-w-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 sm:px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
          <Newspaper className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-zinc-900">Mural informativo</h2>
          <p className="text-xs text-zinc-500">Noticias, eventos y blog de la empresa</p>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {items === null && <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />}
        {items !== null && items.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-500">Todavía no hay publicaciones.</p>
        )}
        {items?.map((item) => (
          <TarjetaBoletin key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
