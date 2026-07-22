"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ExternalLink, FileText, Loader2, Pencil, Sparkles, Target, Upload } from "lucide-react";
import {
  actualizarCvDatosTalento,
  actualizarCvTalento,
  authHeaders,
  compararCvTalento,
  type ComparacionCv,
  type CvDatosExtraidos,
} from "@/lib/api";
import { mensajeError } from "@/lib/errores";

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
    } catch (err) {
      setError(mensajeError(err, "No se pudo subir el CV. Intenta de nuevo."));
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

function ColorPuntaje(puntaje: number): string {
  if (puntaje >= 70) return "text-success";
  if (puntaje >= 40) return "text-warning";
  return "text-destructive";
}

function CompararCv({ talentoId }: { talentoId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [evaluando, setEvaluando] = useState(false);
  const [resultado, setResultado] = useState<ComparacionCv | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  async function handleComparar() {
    if (!descripcion.trim()) return;
    setEvaluando(true);
    setError(null);
    setResultado(undefined);
    try {
      const r = await compararCvTalento(talentoId, descripcion.trim());
      setResultado(r.comparacion);
      if (!r.evaluado) setError("No se pudo completar el análisis con IA. Intenta de nuevo.");
    } catch (err) {
      setError(mensajeError(err, "No se pudo comparar el CV."));
    } finally {
      setEvaluando(false);
    }
  }

  return (
    <div className="border-t border-border pt-3">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Target className="h-3.5 w-3.5" />
        Comparar con una descripción de puesto
      </button>

      {abierto && (
        <div className="mt-3 space-y-3">
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={5}
            maxLength={6000}
            placeholder="Pega aquí la descripción del puesto (actual o uno al que podría aplicar en el futuro)..."
            className={CAMPO_CLASES}
          />
          <button
            onClick={() => void handleComparar()}
            disabled={evaluando || !descripcion.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {evaluando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {evaluando ? "Analizando..." : "Comparar con IA"}
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}

          {resultado && (
            <div className="space-y-3 rounded-md bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <span className={`font-display text-2xl font-semibold tabular-nums ${ColorPuntaje(resultado.puntajeAjuste)}`}>
                  {resultado.puntajeAjuste}
                </span>
                <span className="text-xs text-muted-foreground">/ 100 de ajuste</span>
              </div>
              <p className="text-sm text-foreground">{resultado.resumen}</p>

              {resultado.fortalezas.length > 0 && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Fortalezas</p>
                  <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                    {resultado.fortalezas.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resultado.brechas.length > 0 && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Brechas</p>
                  <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                    {resultado.brechas.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resultado.otrosRolesSugeridos.length > 0 && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Otros roles a los que podría aplicar
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {resultado.otrosRolesSugeridos.map((r) => (
                      <span key={r} className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
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

          {editable && <CompararCv talentoId={talentoId} />}

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
