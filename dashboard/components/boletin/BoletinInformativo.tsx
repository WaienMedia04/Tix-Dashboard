"use client";

import { useEffect, useState } from "react";
import { Cake, Calendar, FileCheck2, Newspaper, Palmtree, Sparkles, Stethoscope } from "lucide-react";
import {
  type AusenciaHoyBoletinItem,
  type BoletinHoyResponse,
  type BoletinItem,
  type TipoBoletin,
  fetchBoletin,
  fetchBoletinHoy,
} from "@/lib/api";

const INTERVALO_POLLING_MS = 60_000;

const META_TIPO: Record<TipoBoletin, { label: string; icon: typeof Newspaper; texto: string; fondo: string }> = {
  NOTICIA: { label: "Noticia", icon: Newspaper, texto: "text-blue-600", fondo: "bg-blue-50" },
  EVENTO: { label: "Evento", icon: Calendar, texto: "text-amber-600", fondo: "bg-amber-50" },
  BLOG: { label: "Blog", icon: Sparkles, texto: "text-primary", fondo: "bg-primary/10" },
};

const META_TIPO_AUSENCIA: Record<
  AusenciaHoyBoletinItem["tipo"],
  { label: string; icon: typeof Palmtree; texto: string; fondo: string }
> = {
  VACACIONES: { label: "Vacaciones", icon: Palmtree, texto: "text-amber-600", fondo: "bg-amber-50" },
  PERMISO: { label: "Permiso", icon: FileCheck2, texto: "text-sky-600", fondo: "bg-sky-50" },
  LICENCIA_MEDICA: { label: "Licencia médica", icon: Stethoscope, texto: "text-rose-600", fondo: "bg-rose-50" },
};

function ChipHoy({
  nombre,
  fotoUrl,
  icon: Icon,
  label,
  texto,
  fondo,
}: {
  nombre: string;
  fotoUrl: string | null;
  icon: typeof Palmtree;
  label: string;
  texto: string;
  fondo: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white py-1 pr-2.5 pl-1 text-xs">
      {fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fotoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-semibold text-zinc-600">
          {nombre.charAt(0)}
        </span>
      )}
      <span className="font-medium text-zinc-800">{nombre.split(" ")[0]}</span>
      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${fondo} ${texto}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    </div>
  );
}

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
export function BoletinInformativo({
  slug,
  dentroDeVentana = false,
}: {
  slug: string;
  /** true cuando VentanaEscritorio ya provee el marco/encabezado — evita duplicarlo. */
  dentroDeVentana?: boolean;
}) {
  const [items, setItems] = useState<BoletinItem[] | null>(null);
  const [hoy, setHoy] = useState<BoletinHoyResponse | null>(null);

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
      fetchBoletinHoy(slug)
        .then((r) => {
          if (!cancelado) setHoy(r);
        })
        .catch(() => {});
    }
    cargar();
    const id = setInterval(cargar, INTERVALO_POLLING_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [slug]);

  return (
    <div
      className={
        dentroDeVentana
          ? "w-full min-w-0 flex-1 bg-transparent"
          : "w-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 lg:max-w-2xl"
      }
    >
      {!dentroDeVentana && (
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 sm:px-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
            <Newspaper className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-zinc-900">Mural informativo</h2>
            <p className="text-xs text-zinc-500">Noticias, eventos y blog de la empresa</p>
          </div>
        </div>
      )}

      <div className="space-y-3 p-4 sm:p-5">
        {hoy && (hoy.cumpleanos.length > 0 || hoy.ausencias.length > 0) && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
            <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Hoy en la empresa</p>
            <div className="flex flex-wrap gap-1.5">
              {hoy.cumpleanos.map((c) => (
                <ChipHoy
                  key={`cumple-${c.talentoId}`}
                  nombre={c.nombreCompleto}
                  fotoUrl={c.fotoUrl}
                  icon={Cake}
                  label="Cumpleaños"
                  texto="text-pink-600"
                  fondo="bg-pink-50"
                />
              ))}
              {hoy.ausencias.map((a) => {
                const meta = META_TIPO_AUSENCIA[a.tipo];
                return (
                  <ChipHoy
                    key={`ausencia-${a.talentoId}-${a.tipo}`}
                    nombre={a.nombreCompleto}
                    fotoUrl={a.fotoUrl}
                    icon={meta.icon}
                    label={meta.label}
                    texto={meta.texto}
                    fondo={meta.fondo}
                  />
                );
              })}
            </div>
          </div>
        )}

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
