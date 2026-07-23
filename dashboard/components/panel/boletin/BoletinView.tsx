"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Calendar, Image as ImageIcon, Loader2, Newspaper, Pencil, Plus, Sparkles, Trash2, Upload, X } from "lucide-react";
import {
  type BoletinItem,
  type TipoBoletin,
  actualizarBoletin,
  authHeaders,
  borrarBoletin,
  crearBoletin,
  fetchBoletin,
} from "@/lib/api";
import { mensajeError } from "@/lib/errores";
import { usePanel } from "../PanelContext";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonTableRows } from "@/components/motion/Skeleton";

const TIPOS_IMAGEN_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

const TIPOS: { valor: TipoBoletin; label: string; icon: typeof Newspaper; texto: string; fondo: string }[] = [
  { valor: "NOTICIA", label: "Noticia", icon: Newspaper, texto: "text-info", fondo: "bg-info/10" },
  { valor: "EVENTO", label: "Evento", icon: Calendar, texto: "text-warning", fondo: "bg-warning/10" },
  { valor: "BLOG", label: "Blog", icon: Sparkles, texto: "text-primary", fondo: "bg-primary/10" },
];

function metaTipo(tipo: TipoBoletin) {
  return TIPOS.find((t) => t.valor === tipo) ?? TIPOS[0];
}

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" });
}

interface FormValores {
  tipo: TipoBoletin;
  titulo: string;
  contenido: string;
  fechaEvento: string;
  imagenUrl: string | null;
}

const VALORES_VACIOS: FormValores = { tipo: "NOTICIA", titulo: "", contenido: "", fechaEvento: "", imagenUrl: null };

function TarjetaBoletin({
  item,
  onEditar,
  onBorrar,
}: {
  item: BoletinItem;
  onEditar: () => void;
  onBorrar: () => void;
}) {
  const meta = metaTipo(item.tipo);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 shadow-card">
      {item.imagenUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imagenUrl} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
      ) : (
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.fondo}`}>
          <meta.icon className={`h-4 w-4 ${meta.texto}`} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
            <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${meta.fondo} ${meta.texto}`}>{meta.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEditar}
              aria-label="Editar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onBorrar}
              aria-label="Borrar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="mt-1 line-clamp-3 text-sm whitespace-pre-wrap text-muted-foreground">{item.contenido}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground/70">
          {item.tipo === "EVENTO" && item.fechaEvento ? `Evento: ${formatearFecha(item.fechaEvento)} · ` : ""}
          Publicado por {item.autorNombre} el {formatearFecha(item.createdAt)}
        </p>
      </div>
    </div>
  );
}

function FormularioBoletin({
  slug,
  editando,
  onGuardado,
  onCancelarEdicion,
}: {
  slug: string;
  editando: BoletinItem | null;
  onGuardado: (item: BoletinItem, esEdicion: boolean) => void;
  onCancelarEdicion: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [valores, setValores] = useState<FormValores>(VALORES_VACIOS);
  const [enviando, setEnviando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputImagenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- precarga intencional al hacer clic en "Editar"
      setValores({
        tipo: editando.tipo,
        titulo: editando.titulo,
        contenido: editando.contenido,
        fechaEvento: editando.fechaEvento ? editando.fechaEvento.slice(0, 10) : "",
        imagenUrl: editando.imagenUrl,
      });
      setAbierto(true);
    }
  }, [editando]);

  async function handleImagenSeleccionada(file: File) {
    if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.type)) {
      setError("Solo se aceptan imágenes PNG, JPEG o WebP.");
      return;
    }
    setError(null);
    setSubiendoImagen(true);
    try {
      const blob = await upload(`empresas/${slug}/boletin-${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: `/api/empresas/${slug}/boletin/imagen`,
        headers: await authHeaders(),
      });
      setValores((v) => ({ ...v, imagenUrl: blob.url }));
    } catch (err) {
      setError(mensajeError(err, "No se pudo subir la imagen. Intenta de nuevo."));
    } finally {
      setSubiendoImagen(false);
    }
  }

  function cerrar() {
    setAbierto(false);
    setValores(VALORES_VACIOS);
    setError(null);
    if (editando) onCancelarEdicion();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valores.titulo.trim() || !valores.contenido.trim()) return;
    if (valores.tipo === "EVENTO" && !valores.fechaEvento) {
      setError("Los eventos necesitan una fecha.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const datos = {
        tipo: valores.tipo,
        titulo: valores.titulo.trim(),
        contenido: valores.contenido.trim(),
        imagenUrl: valores.imagenUrl,
        ...(valores.tipo === "EVENTO" && valores.fechaEvento ? { fechaEvento: valores.fechaEvento } : {}),
      };
      const item = editando
        ? await actualizarBoletin(slug, editando.id, datos)
        : await crearBoletin(slug, { ...datos, imagenUrl: valores.imagenUrl ?? undefined });
      onGuardado(item, !!editando);
      cerrar();
    } catch {
      setError("No se pudo guardar la publicación.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {editando ? "Editando publicación" : "Publicar en el mural informativo"}
        </p>
        {!editando && (
          <button
            onClick={() => (abierto ? cerrar() : setAbierto(true))}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {abierto ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {abierto ? "Cerrar" : "Nueva"}
          </button>
        )}
      </div>

      {abierto && (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 border-t border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tipo</label>
              <select
                value={valores.tipo}
                onChange={(e) => setValores((v) => ({ ...v, tipo: e.target.value as TipoBoletin }))}
                className={CAMPO_CLASES}
              >
                {TIPOS.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {valores.tipo === "EVENTO" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Fecha del evento</label>
                <input
                  type="date"
                  value={valores.fechaEvento}
                  onChange={(e) => setValores((v) => ({ ...v, fechaEvento: e.target.value }))}
                  className={CAMPO_CLASES}
                  required
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Título</label>
            <input
              value={valores.titulo}
              onChange={(e) => setValores((v) => ({ ...v, titulo: e.target.value }))}
              maxLength={120}
              className={CAMPO_CLASES}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Contenido</label>
            <textarea
              value={valores.contenido}
              onChange={(e) => setValores((v) => ({ ...v, contenido: e.target.value }))}
              rows={5}
              maxLength={4000}
              className={CAMPO_CLASES}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Imagen (opcional)</label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                {valores.imagenUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={valores.imagenUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => inputImagenRef.current?.click()}
                    disabled={subiendoImagen}
                    className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                  >
                    {subiendoImagen ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {subiendoImagen ? "Subiendo..." : valores.imagenUrl ? "Cambiar imagen" : "Subir imagen"}
                  </button>
                  {valores.imagenUrl && (
                    <button
                      type="button"
                      onClick={() => setValores((v) => ({ ...v, imagenUrl: null }))}
                      className="text-xs font-medium text-muted-foreground hover:text-destructive"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">PNG, JPEG o WebP — máx. 5 MB.</p>
              </div>
            </div>
            <input
              ref={inputImagenRef}
              type="file"
              accept={TIPOS_IMAGEN_PERMITIDOS.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImagenSeleccionada(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Guardando..." : editando ? "Guardar cambios" : "Publicar"}
            </button>
            {editando && (
              <button type="button" onClick={cerrar} className="text-xs font-medium text-muted-foreground hover:text-foreground">
                Cancelar
              </button>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; items: BoletinItem[] };

export function BoletinView() {
  const { slug } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [editando, setEditando] = useState<BoletinItem | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchBoletin(slug)
      .then((r) => {
        if (!cancelado) setEstado({ tipo: "listo", items: r.data });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug]);

  function handleGuardado(item: BoletinItem, esEdicion: boolean) {
    setEstado((prev) => {
      if (prev.tipo !== "listo") return prev;
      return {
        tipo: "listo",
        items: esEdicion ? prev.items.map((i) => (i.id === item.id ? item : i)) : [item, ...prev.items],
      };
    });
    setEditando(null);
  }

  async function handleBorrar(item: BoletinItem) {
    if (!confirm(`¿Borrar "${item.titulo}"?`)) return;
    setEstado((prev) => (prev.tipo === "listo" ? { tipo: "listo", items: prev.items.filter((i) => i.id !== item.id) } : prev));
    try {
      await borrarBoletin(slug, item.id);
    } catch {
      // ya se quitó del estado local
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">Mural informativo</h1>
        <p className="text-sm text-muted-foreground">
          Noticias, eventos y blog visibles para todo el equipo, junto a la Pizarra en el mural de cada talento.
        </p>
      </div>

      <FormularioBoletin slug={slug} editando={editando} onGuardado={handleGuardado} onCancelarEdicion={() => setEditando(null)} />

      {estado.tipo === "cargando" && (
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full">
            <tbody>
              <SkeletonTableRows rows={5} cols={1} />
            </tbody>
          </table>
        </div>
      )}
      {estado.tipo === "error" && <p className="text-sm text-destructive">No se pudo cargar el mural informativo.</p>}
      {estado.tipo === "listo" && estado.items.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
          Todavía no hay nada publicado.
        </div>
      )}
      {estado.tipo === "listo" && estado.items.length > 0 && (
        <StaggerGroup className="space-y-2">
          {estado.items.map((item) => (
            <StaggerItem key={item.id}>
              <TarjetaBoletin item={item} onEditar={() => setEditando(item)} onBorrar={() => void handleBorrar(item)} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
