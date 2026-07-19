"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Gift, Loader2, Sparkles, Upload } from "lucide-react";
import {
  type EmpleadoResumen,
  type EstampaDefinicion,
  type TipoEstampaForma,
  actualizarEstampaDefinicion,
  authHeaders,
  crearEstampaDefinicion,
  fetchEstampas,
  otorgarEstampa,
} from "@/lib/api";
import { claseFormaEstampa, FORMAS_ESTAMPA } from "@/lib/estampa-forma";
import { mensajeError } from "@/lib/errores";
import { Modal } from "@/components/Modal";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

function ModalNuevaEstampa({
  slug,
  onClose,
  onCreada,
}: {
  slug: string;
  onClose: () => void;
  onCreada: (definicion: EstampaDefinicion) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [nombre, setNombre] = useState("");
  const [forma, setForma] = useState<TipoEstampaForma>("REDONDEADO");
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError("Solo se aceptan imágenes PNG, JPEG o WebP.");
      return;
    }
    setError(null);
    setSubiendo(true);
    try {
      const blob = await upload(`estampas/${slug}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/estampas/upload",
        headers: await authHeaders(),
      });
      setImagenUrl(blob.url);
    } catch (err) {
      setError(mensajeError(err, "No se pudo subir la imagen. Intenta de nuevo."));
    } finally {
      setSubiendo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !imagenUrl) return;
    setError(null);
    setGuardando(true);
    try {
      const definicion = await crearEstampaDefinicion(slug, { nombre: nombre.trim(), imagenUrl, forma });
      onCreada(definicion);
      onClose();
    } catch {
      setError("No se pudo crear la estampa. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Nueva estampa" description="Se agrega al catálogo para regalar a empleados.">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Estrella del mes"
            required
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Forma</label>
          <div className="flex flex-wrap gap-2">
            {FORMAS_ESTAMPA.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setForma(f.value)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  forma === f.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {forma === "LIBRE" && (
            <p className="text-[11px] text-muted-foreground">
              Sube una imagen PNG o WebP con fondo transparente para que la estampa quede sin bordes.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Imagen</label>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden ${
                forma === "LIBRE" ? "" : "border border-border bg-muted"
              } ${claseFormaEstampa(forma)}`}
            >
              {imagenUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagenUrl}
                  alt=""
                  className={`h-full w-full ${forma === "LIBRE" ? "object-contain" : "object-cover"}`}
                />
              ) : (
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={subiendo}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {subiendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {subiendo ? "Subiendo..." : imagenUrl ? "Cambiar imagen" : "Subir imagen"}
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={TIPOS_PERMITIDOS.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={guardando || !nombre.trim() || !imagenUrl}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Creando..." : "Crear estampa"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalRegalarEstampa({
  slug,
  definicion,
  empleados,
  onClose,
}: {
  slug: string;
  definicion: EstampaDefinicion;
  empleados: EmpleadoResumen[];
  onClose: () => void;
}) {
  const [talentoId, setTalentoId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!talentoId) return;
    setError(null);
    setEnviando(true);
    try {
      await otorgarEstampa(slug, definicion.id, talentoId, mensaje.trim() || undefined);
      setEnviado(true);
    } catch {
      setError("No se pudo regalar la estampa. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Regalar "${definicion.nombre}"`} description="Aparecerá en el mural del empleado.">
      {enviado ? (
        <div className="space-y-3">
          <p className="text-sm text-success">¡Estampa regalada!</p>
          <button
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Empleado</label>
            <select
              value={talentoId}
              onChange={(e) => setTalentoId(e.target.value)}
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecciona...</option>
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombreCompleto}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Mensaje (opcional)
            </label>
            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej. ¡Gracias por tu esfuerzo este mes!"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={enviando || !talentoId}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Regalar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function EstampasCatalogo({ slug, empleados }: { slug: string; empleados: EmpleadoResumen[] }) {
  const [definiciones, setDefiniciones] = useState<EstampaDefinicion[] | null>(null);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [regalando, setRegalando] = useState<EstampaDefinicion | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchEstampas(slug)
      .then((d) => {
        if (!cancelado) setDefiniciones(d);
      })
      .catch(() => {
        if (!cancelado) setDefiniciones([]);
      });
    return () => {
      cancelado = true;
    };
  }, [slug]);

  async function toggleActivo(definicion: EstampaDefinicion) {
    try {
      const actualizada = await actualizarEstampaDefinicion(slug, definicion.id, { activo: !definicion.activo });
      setDefiniciones((prev) => prev?.map((d) => (d.id === definicion.id ? actualizada : d)) ?? prev);
    } catch {
      // sin cambios visibles si falla
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Estampas {definiciones ? `(${definiciones.length})` : ""}
          </p>
        </div>
        <button
          onClick={() => setMostrarNueva(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Nueva estampa
        </button>
      </div>

      {definiciones === null && <div className="mt-3 h-16 animate-pulse rounded-md bg-muted" />}

      {definiciones !== null && definiciones.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">Todavía no has creado estampas.</p>
      )}

      {definiciones !== null && definiciones.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {definiciones.map((d) => (
            <div key={d.id} className="flex w-28 flex-col items-center gap-1.5 text-center">
              <div
                className={`h-16 w-16 overflow-hidden ${d.forma === "LIBRE" ? "" : "border border-border bg-muted"} ${claseFormaEstampa(
                  d.forma,
                )} ${d.activo ? "" : "opacity-40"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.imagenUrl}
                  alt={d.nombre}
                  className={`h-full w-full ${d.forma === "LIBRE" ? "object-contain" : "object-cover"}`}
                />
              </div>
              <p className="line-clamp-1 text-xs font-medium text-foreground">{d.nombre}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRegalando(d)}
                  disabled={!d.activo}
                  title="Regalar"
                  className="flex h-6 w-6 items-center justify-center rounded text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Gift className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => void toggleActivo(d)}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {d.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarNueva && (
        <ModalNuevaEstampa
          slug={slug}
          onClose={() => setMostrarNueva(false)}
          onCreada={(nueva) => setDefiniciones((prev) => (prev ? [nueva, ...prev] : [nueva]))}
        />
      )}

      {regalando && (
        <ModalRegalarEstampa
          slug={slug}
          definicion={regalando}
          empleados={empleados}
          onClose={() => setRegalando(null)}
        />
      )}
    </div>
  );
}
