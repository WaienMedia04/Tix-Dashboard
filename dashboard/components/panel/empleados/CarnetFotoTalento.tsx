"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { IdCard, Loader2, Upload, X } from "lucide-react";
import { actualizarCarnetTalento, authHeaders } from "@/lib/api";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

export function CarnetFotoTalento({
  talentoId,
  carnetFotoUrl,
  editable,
  onActualizado,
}: {
  talentoId: string;
  carnetFotoUrl: string | null;
  editable: boolean;
  onActualizado: (carnetFotoUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [quitando, setQuitando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError("Solo se aceptan imágenes PNG, JPEG o WebP.");
      return;
    }
    setError(null);
    setSubiendo(true);
    try {
      const blob = await upload(`talentos/${talentoId}/carnet-${file.name}`, file, {
        access: "public",
        handleUploadUrl: `/api/talentos/${talentoId}/carnet`,
        headers: await authHeaders(),
      });
      const actualizado = await actualizarCarnetTalento(talentoId, blob.url);
      onActualizado(actualizado.carnetFotoUrl);
    } catch {
      setError("No se pudo subir la imagen del carnet. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  async function handleQuitar() {
    setError(null);
    setQuitando(true);
    try {
      const actualizado = await actualizarCarnetTalento(talentoId, null);
      onActualizado(actualizado.carnetFotoUrl);
    } catch {
      setError("No se pudo quitar la imagen del carnet. Intenta de nuevo.");
    } finally {
      setQuitando(false);
    }
  }

  if (!editable && !carnetFotoUrl) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <IdCard className="h-4 w-4" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Imagen del carnet</p>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
          {carnetFotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={carnetFotoUrl} alt="Imagen del carnet" className="h-full w-full object-cover" />
          ) : (
            <IdCard className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">
            {carnetFotoUrl
              ? "Se usa en la cara frontal del carnet de Mi Mural, en vez de la foto de perfil."
              : "Opcional: si tu empresa usa un carnet real distinto de la foto de perfil, súbelo aquí."}
          </p>
          {editable && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={subiendo || quitando}
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {subiendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {subiendo ? "Subiendo..." : carnetFotoUrl ? "Cambiar imagen" : "Subir imagen (opcional)"}
              </button>
              {carnetFotoUrl && (
                <button
                  onClick={() => void handleQuitar()}
                  disabled={subiendo || quitando}
                  className="inline-flex w-fit items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  {quitando ? "Quitando..." : "Quitar"}
                </button>
              )}
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>

      {editable && (
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
      )}
    </div>
  );
}
