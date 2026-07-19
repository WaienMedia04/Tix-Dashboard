"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { actualizarLogoEmpresa, authHeaders } from "@/lib/api";
import { mensajeError } from "@/lib/errores";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export function LogoEmpresa({
  slug,
  logoUrl,
  onActualizado,
}: {
  slug: string;
  logoUrl: string | null;
  onActualizado: (logoUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError("Solo se aceptan imágenes PNG, JPEG, WebP o SVG.");
      return;
    }
    setError(null);
    setSubiendo(true);
    try {
      const blob = await upload(`empresas/${slug}/logo-${file.name}`, file, {
        access: "public",
        handleUploadUrl: `/api/empresas/${slug}/logo`,
        headers: await authHeaders(),
      });
      const actualizado = await actualizarLogoEmpresa(slug, blob.url);
      onActualizado(actualizado.logoUrl ?? blob.url);
    } catch (err) {
      setError(mensajeError(err, "No se pudo subir el logo. Intenta de nuevo."));
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <ImageIcon className="h-4 w-4" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Logo de la empresa
        </p>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo de la empresa" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">
            Aparece en la cara trasera del carnet de Mi Mural de cada empleado.
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {subiendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {subiendo ? "Subiendo..." : logoUrl ? "Cambiar logo" : "Subir logo"}
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
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
  );
}
