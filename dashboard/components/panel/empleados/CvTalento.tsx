"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ExternalLink, FileText, Loader2, Pencil, Sparkles, Upload } from "lucide-react";
import { actualizarCvDatosTalento, actualizarCvTalento, authHeaders, type CvDatosExtraidos } from "@/lib/api";

const CAMPO_CLASES =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

interface CvActualizado {
  cvUrl: string | null;
  cvDatosExtraidos: CvDatosExtraidos | null;
}

function SubidaCv({
  talentoId,
  reintentar,
  onSubido,
}: {
  talentoId: string;
  reintentar: boolean;
  onSubido: (datos: CvActualizado) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF.");
      return;
    }
    setError(null);
    setSubiendo(true);
    try {
      const blob = await upload(`talentos/${talentoId}/cv-${file.name}`, file, {
        access: "public",
        handleUploadUrl: `/api/talentos/${talentoId}/cv`,
        headers: await authHeaders(),
      });
      const actualizado = await actualizarCvTalento(talentoId, blob.url);
      onSubido(actualizado);
    } catch {
      setError("No se pudo subir el CV. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <FileText className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {reintentar ? "No se pudieron extraer datos de este CV. Prueba con otro archivo." : "Todavía no se ha subido un CV para este empleado."}
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {subiendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {subiendo ? "Subiendo y extrayendo..." : reintentar ? "Subir otro CV" : "Subir CV (PDF)"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
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

export function CvTalento({
  talentoId,
  cvUrl,
  cvDatosExtraidos,
  editable,
  onActualizado,
}: {
  talentoId: string;
  cvUrl: string | null;
  cvDatosExtraidos: CvDatosExtraidos | null;
  editable: boolean;
  onActualizado: (datos: CvActualizado) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ resumen: "", habilidades: "", correo: "", telefono: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function iniciarEdicion() {
    if (!cvDatosExtraidos) return;
    setForm({
      resumen: cvDatosExtraidos.resumenParaRRHH,
      habilidades: cvDatosExtraidos.habilidades.join(", "),
      correo: cvDatosExtraidos.contacto.correo ?? "",
      telefono: cvDatosExtraidos.contacto.telefono ?? "",
    });
    setError(null);
    setEditando(true);
  }

  function guardar() {
    setGuardando(true);
    setError(null);
    actualizarCvDatosTalento(talentoId, {
      resumenParaRRHH: form.resumen,
      habilidades: form.habilidades
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      correo: form.correo,
      telefono: form.telefono,
    })
      .then((actualizado) => {
        onActualizado(actualizado);
        setEditando(false);
      })
      .catch(() => setError("No se pudo guardar. Intenta de nuevo."))
      .finally(() => setGuardando(false));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            CV y datos extraídos por IA
          </p>
        </div>
        <div className="flex items-center gap-3">
          {cvUrl && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="h-3 w-3" />
              Ver CV
            </a>
          )}
          {editable && cvDatosExtraidos && !editando && (
            <button
              onClick={iniciarEdicion}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </button>
          )}
        </div>
      </div>

      {!cvDatosExtraidos ? (
        editable ? (
          <SubidaCv talentoId={talentoId} reintentar={cvUrl !== null} onSubido={onActualizado} />
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Sin CV cargado todavía.</p>
        )
      ) : editando ? (
        <div className="mt-3 space-y-3">
          {error && <p className="text-xs text-destructive">{error}</p>}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">Resumen para RRHH</span>
            <textarea
              value={form.resumen}
              onChange={(e) => setForm((p) => ({ ...p, resumen: e.target.value }))}
              rows={3}
              className={CAMPO_CLASES}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">Habilidades (separadas por coma)</span>
            <input
              value={form.habilidades}
              onChange={(e) => setForm((p) => ({ ...p, habilidades: e.target.value }))}
              className={CAMPO_CLASES}
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Correo (del CV)</span>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))}
                className={CAMPO_CLASES}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Teléfono (del CV)</span>
              <input
                value={form.telefono}
                onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                className={CAMPO_CLASES}
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={guardar}
              disabled={guardando}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar y confirmar"}
            </button>
            <button
              onClick={() => setEditando(false)}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <p className="text-sm text-foreground">{cvDatosExtraidos.resumenParaRRHH}</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground">Correo (CV):</span> {cvDatosExtraidos.contacto.correo ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground">Teléfono (CV):</span> {cvDatosExtraidos.contacto.telefono ?? "—"}
            </p>
          </div>

          {cvDatosExtraidos.habilidades.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Habilidades
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cvDatosExtraidos.habilidades.map((h) => (
                  <span key={h} className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cvDatosExtraidos.experienciaLaboral.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Experiencia laboral
              </p>
              <ul className="space-y-2">
                {cvDatosExtraidos.experienciaLaboral.map((exp, idx) => (
                  <li key={idx} className="rounded-md bg-muted/50 p-2.5 text-sm">
                    <p className="font-medium text-foreground">
                      {exp.puesto} — {exp.empresa}
                    </p>
                    {exp.periodo && <p className="text-xs text-muted-foreground">{exp.periodo}</p>}
                    {exp.descripcion && <p className="mt-1 text-xs text-muted-foreground">{exp.descripcion}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cvDatosExtraidos.educacion.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Educación
              </p>
              <ul className="space-y-1">
                {cvDatosExtraidos.educacion.map((edu, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    <span className="text-foreground">{edu.titulo}</span> — {edu.institucion}
                    {edu.anio && ` (${edu.anio})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {editable && (
            <div className="border-t border-border pt-3">
              <SubidaCv talentoId={talentoId} reintentar onSubido={onActualizado} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
