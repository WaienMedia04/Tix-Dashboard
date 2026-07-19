"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Camera, Loader2 } from "lucide-react";
import { actualizarFotoTalento, authHeaders } from "@/lib/api";
import { mensajeError } from "@/lib/errores";
import { Avatar } from "@/components/Avatar";
import { AjustarFotoModal } from "./AjustarFotoModal";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

export function FotoTalento({
  talentoId,
  nombreCompleto,
  fotoUrl,
  editable,
  onActualizada,
}: {
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  editable: boolean;
  onActualizada: (fotoUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenParaAjustar, setImagenParaAjustar] = useState<string | null>(null);

  function cerrarAjuste() {
    if (imagenParaAjustar) URL.revokeObjectURL(imagenParaAjustar);
    setImagenParaAjustar(null);
  }

  async function subirBlob(blob: Blob) {
    setError(null);
    setSubiendo(true);
    try {
      const archivo = new File([blob], "foto.jpg", { type: "image/jpeg" });
      const subida = await upload(`talentos/${talentoId}/foto-${archivo.name}`, archivo, {
        access: "public",
        handleUploadUrl: `/api/talentos/${talentoId}/foto`,
        headers: await authHeaders(),
      });
      const actualizado = await actualizarFotoTalento(talentoId, subida.url);
      onActualizada(actualizado.fotoUrl ?? subida.url);
    } catch (err) {
      setError(mensajeError(err, "No se pudo subir la foto. Intenta de nuevo."));
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <Avatar nombreCompleto={nombreCompleto} fotoUrl={fotoUrl} size="xl" />
      {editable && (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            aria-label="Cambiar foto"
            className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-elegant transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {subiendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={TIPOS_PERMITIDOS.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (!TIPOS_PERMITIDOS.includes(file.type)) {
                setError("Solo se aceptan imágenes PNG, JPEG o WebP.");
                return;
              }
              setError(null);
              setImagenParaAjustar(URL.createObjectURL(file));
            }}
          />
        </>
      )}
      {error && <p className="absolute top-full left-0 mt-1 w-40 text-xs text-destructive">{error}</p>}
      {imagenParaAjustar && (
        <AjustarFotoModal
          imagenSrc={imagenParaAjustar}
          onCancelar={cerrarAjuste}
          onGuardar={(blob) => {
            cerrarAjuste();
            void subirBlob(blob);
          }}
        />
      )}
    </div>
  );
}
