"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, CalendarX, FileText, HeartHandshake, Plus, Trophy } from "lucide-react";
import { type NovedadItem, type TipoNovedad, crearNovedad, fetchNovedades } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { Avatar } from "@/components/Avatar";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonTableRows } from "@/components/motion/Skeleton";

const TIPOS: { valor: TipoNovedad; label: string; icon: typeof Trophy; texto: string; fondo: string }[] = [
  { valor: "LOGRO", label: "Logro", icon: Trophy, texto: "text-success", fondo: "bg-success/10" },
  { valor: "BUENA_ACCION", label: "Buena acción", icon: HeartHandshake, texto: "text-success", fondo: "bg-success/10" },
  { valor: "AUSENCIA", label: "Ausencia", icon: CalendarX, texto: "text-warning", fondo: "bg-warning/10" },
  { valor: "ERROR", label: "Error", icon: AlertOctagon, texto: "text-destructive", fondo: "bg-destructive/10" },
  { valor: "SITUACION", label: "Situación", icon: FileText, texto: "text-info", fondo: "bg-info/10" },
];

function metaTipo(tipo: TipoNovedad) {
  return TIPOS.find((t) => t.valor === tipo) ?? TIPOS[4];
}

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

function hoyIso(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString().slice(0, 10);
}

function TarjetaNovedad({ novedad }: { novedad: NovedadItem }) {
  const meta = metaTipo(novedad.tipo);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 shadow-card">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.fondo}`}>
        <meta.icon className={`h-4 w-4 ${meta.texto}`} />
      </span>
      <Avatar nombreCompleto={novedad.nombreCompleto} fotoUrl={novedad.fotoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{novedad.nombreCompleto}</p>
            <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${meta.fondo} ${meta.texto}`}>{meta.label}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{formatearFecha(novedad.fecha)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{novedad.descripcion}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">Registrado por {novedad.creadoPorNombre}</p>
      </div>
    </div>
  );
}

function FormularioNovedad({
  slug,
  onCreada,
}: {
  slug: string;
  onCreada: (novedad: NovedadItem) => void;
}) {
  const { dashboardInicial } = usePanel();
  const talentos = dashboardInicial.rankingTalentos;
  const [abierto, setAbierto] = useState(false);
  const [talentoId, setTalentoId] = useState("");
  const [tipo, setTipo] = useState<TipoNovedad>("LOGRO");
  const [fecha, setFecha] = useState(hoyIso);
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!talentoId || !descripcion.trim()) return;
    setEnviando(true);
    setError(null);
    crearNovedad(slug, { talentoId, tipo, fecha, descripcion: descripcion.trim() })
      .then((novedad) => {
        onCreada(novedad);
        setDescripcion("");
        setAbierto(false);
      })
      .catch(() => setError("No se pudo registrar la novedad."))
      .finally(() => setEnviando(false));
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Registrar novedad</p>
        <button
          onClick={() => setAbierto((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva
        </button>
      </div>

      {abierto && (
        <form onSubmit={handleSubmit} className="space-y-3 border-t border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Empleado</label>
              <select value={talentoId} onChange={(e) => setTalentoId(e.target.value)} className={CAMPO_CLASES} required>
                <option value="">Selecciona un empleado</option>
                {talentos.map((t) => (
                  <option key={t.talentoId} value={t.talentoId}>
                    {t.nombreCompleto}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoNovedad)} className={CAMPO_CLASES}>
                {TIPOS.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={CAMPO_CLASES} required />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className={CAMPO_CLASES}
              placeholder="¿Qué pasó?"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Guardando..." : "Guardar"}
            </button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; novedades: NovedadItem[] };

export function NovedadesView() {
  const { slug } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [filtroTipo, setFiltroTipo] = useState<TipoNovedad | "">("");

  useEffect(() => {
    let cancelado = false;
    fetchNovedades(slug, filtroTipo ? { tipo: filtroTipo } : {})
      .then((novedades) => {
        if (!cancelado) setEstado({ tipo: "listo", novedades });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, filtroTipo]);

  function handleCreada(novedad: NovedadItem) {
    setEstado((prev) => (prev.tipo === "listo" ? { tipo: "listo", novedades: [novedad, ...prev.novedades] } : prev));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">Novedades</h1>
        <p className="text-sm text-muted-foreground">Logros, buenas acciones, ausencias, errores y situaciones del equipo</p>
      </div>

      <FormularioNovedad slug={slug} onCreada={handleCreada} />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroTipo("")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
            filtroTipo === "" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos
        </button>
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            onClick={() => setFiltroTipo(t.valor)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
              filtroTipo === t.valor ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {estado.tipo === "cargando" && (
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full">
            <tbody>
              <SkeletonTableRows rows={5} cols={1} />
            </tbody>
          </table>
        </div>
      )}
      {estado.tipo === "error" && <p className="text-sm text-destructive">No se pudieron cargar las novedades.</p>}
      {estado.tipo === "listo" && estado.novedades.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
          Todavía no hay novedades registradas.
        </div>
      )}
      {estado.tipo === "listo" && estado.novedades.length > 0 && (
        <StaggerGroup className="space-y-2">
          {estado.novedades.map((novedad) => (
            <StaggerItem key={novedad.id}>
              <TarjetaNovedad novedad={novedad} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
