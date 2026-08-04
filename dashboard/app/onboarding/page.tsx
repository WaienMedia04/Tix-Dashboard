"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Plus, Upload, X } from "lucide-react";
import { crearSolicitudImplementacion, type SolicitudImplementacionInput } from "@/lib/api";
import { mensajeError } from "@/lib/errores";
import { BrandMark } from "@/components/BrandMark";
import MoltenMetal from "@/components/vendor/MoltenMetal/MoltenMetal";

const CAMPO =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";
const LABEL = "mb-1.5 block text-sm font-medium text-foreground";
const HINT = "mb-1.5 text-xs text-muted-foreground";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type Encargado = { nombre: string; departamento: string };

interface FormState {
  empresaNombre: string;
  giroNegocio: string;
  cantidadEmpleados: string;
  logoUrl: string | null;
  departamentos: string[];
  rolesMultiples: string;
  ceoNombre: string;
  rrhhNombre: string;
  encargados: Encargado[];
  rosterArchivoUrl: string | null;
  rosterArchivoNombre: string;
  quiereVacantesIA: "" | "si" | "no";
  canalBitacoras: "" | "grupo" | "privado";
  nombreGrupo: string;
  horaCheckin: string;
  horaCheckout: string;
  diasLaborales: string[];
  receptorAlertas: string;
  buenDiaTrabajo: string;
  medicionPorRol: string;
  queCalificaBajo: string;
  interesaCumplimiento: string;
  baseTalentoDelMes: string;
  contactoNombre: string;
  contactoCargo: string;
  contactoCorreo: string;
  contactoTelefono: string;
}

const VACIO: FormState = {
  empresaNombre: "",
  giroNegocio: "",
  cantidadEmpleados: "",
  logoUrl: null,
  departamentos: [],
  rolesMultiples: "",
  ceoNombre: "",
  rrhhNombre: "",
  encargados: [],
  rosterArchivoUrl: null,
  rosterArchivoNombre: "",
  quiereVacantesIA: "",
  canalBitacoras: "",
  nombreGrupo: "",
  horaCheckin: "",
  horaCheckout: "",
  diasLaborales: [],
  receptorAlertas: "",
  buenDiaTrabajo: "",
  medicionPorRol: "",
  queCalificaBajo: "",
  interesaCumplimiento: "",
  baseTalentoDelMes: "",
  contactoNombre: "",
  contactoCargo: "",
  contactoCorreo: "",
  contactoTelefono: "",
};

const PASOS = [
  "Tu empresa",
  "Estructura organizacional",
  "Tu equipo",
  "Vacantes con IA",
  "Bitácoras con TIX",
  "Cómo miden el desempeño",
  "Datos de contacto",
];

function validarPaso(paso: number, f: FormState): string | null {
  if (paso === 0 && !f.empresaNombre.trim()) return "Cuéntanos el nombre de tu empresa.";
  if (paso === 3 && !f.quiereVacantesIA) return "Selecciona una opción.";
  if (paso === 4 && !f.canalBitacoras) return "Selecciona cómo van a enviar sus bitácoras.";
  if (paso === 6) {
    if (!f.contactoNombre.trim()) return "Falta tu nombre.";
    if (!f.contactoCorreo.trim() || !f.contactoCorreo.includes("@")) return "Escribe un correo válido.";
  }
  return null;
}

function DepartamentosInput({ valor, onChange }: { valor: string[]; onChange: (v: string[]) => void }) {
  const [texto, setTexto] = useState("");
  function agregar() {
    const v = texto.trim();
    if (!v || valor.includes(v)) return;
    onChange([...valor, v]);
    setTexto("");
  }
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregar();
            }
          }}
          placeholder="Ej. Ventas"
          className={CAMPO}
        />
        <button
          type="button"
          onClick={agregar}
          className="flex shrink-0 items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar
        </button>
      </div>
      {valor.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {valor.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {d}
              <button type="button" onClick={() => onChange(valor.filter((x) => x !== d))} aria-label={`Quitar ${d}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EncargadosInput({ valor, onChange }: { valor: Encargado[]; onChange: (v: Encargado[]) => void }) {
  function actualizar(i: number, campo: keyof Encargado, texto: string) {
    onChange(valor.map((e, idx) => (idx === i ? { ...e, [campo]: texto } : e)));
  }
  return (
    <div className="space-y-2">
      {valor.map((e, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={e.nombre}
            onChange={(ev) => actualizar(i, "nombre", ev.target.value)}
            placeholder="Nombre del encargado"
            className={CAMPO}
          />
          <input
            value={e.departamento}
            onChange={(ev) => actualizar(i, "departamento", ev.target.value)}
            placeholder="Departamento"
            className={CAMPO}
          />
          <button
            type="button"
            onClick={() => onChange(valor.filter((_, idx) => idx !== i))}
            aria-label="Quitar"
            className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...valor, { nombre: "", departamento: "" }])}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Agregar encargado
      </button>
    </div>
  );
}

function SubidaArchivo({
  pathnamePrefix,
  aceptar,
  cargando,
  nombreArchivo,
  onSubiendo,
  onListo,
}: {
  pathnamePrefix: string;
  aceptar: string;
  cargando: boolean;
  nombreArchivo?: string;
  onSubiendo: () => void;
  onListo: (url: string, nombre: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    onSubiendo();
    try {
      const blob = await upload(`${pathnamePrefix}${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/onboarding/upload",
      });
      onListo(blob.url, file.name);
    } catch (err) {
      setError(mensajeError(err, "No se pudo subir el archivo."));
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary">
        {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {cargando ? "Subiendo..." : nombreArchivo || "Haz clic para subir el archivo"}
        <input
          type="file"
          accept={aceptar}
          className="hidden"
          disabled={cargando}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </label>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FondoMoltenMetal() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <MoltenMetal
        color1="#1E1B4B"
        color2="#9333EA"
        color3="#22D3EE"
        speed={0.35}
        scale={4}
        detail={3}
        glow={1.6}
        coreSize={0.1}
        swirl={1}
        fold={-0.2}
        blackPoint={0.05}
        brightness={1.3}
        colorMode="molten"
        grain
        grainIntensity={0.05}
        mouseInteraction={false}
        mouseStrength={0.3}
        opacity={1.0}
      />
    </div>
  );
}

export default function OnboardingPage() {
  const [paso, setPaso] = useState(0);
  const [f, setF] = useState<FormState>(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoRoster, setSubiendoRoster] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  function set<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setF((prev) => ({ ...prev, [campo]: valor }));
  }

  function toggleDia(dia: string) {
    set("diasLaborales", f.diasLaborales.includes(dia) ? f.diasLaborales.filter((d) => d !== dia) : [...f.diasLaborales, dia]);
  }

  function siguiente() {
    const err = validarPaso(paso, f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  }

  function atras() {
    setError(null);
    setPaso((p) => Math.max(p - 1, 0));
  }

  async function enviar() {
    const err = validarPaso(6, f);
    if (err) {
      setError(err);
      return;
    }
    setEnviando(true);
    setError(null);
    const datos: SolicitudImplementacionInput = {
      empresaNombre: f.empresaNombre.trim(),
      giroNegocio: f.giroNegocio.trim() || undefined,
      cantidadEmpleados: f.cantidadEmpleados ? Number(f.cantidadEmpleados) : undefined,
      logoUrl: f.logoUrl ?? undefined,
      departamentos: f.departamentos.length ? f.departamentos : undefined,
      rolesMultiples: f.rolesMultiples.trim() || undefined,
      ceoNombre: f.ceoNombre.trim() || undefined,
      rrhhNombre: f.rrhhNombre.trim() || undefined,
      encargadosPorDepartamento: f.encargados.filter((e) => e.nombre.trim() && e.departamento.trim()),
      rosterArchivoUrl: f.rosterArchivoUrl ?? undefined,
      quiereVacantesIA: f.quiereVacantesIA === "si",
      canalBitacoras: f.canalBitacoras as "grupo" | "privado",
      nombreGrupo: f.nombreGrupo.trim() || undefined,
      horaCheckin: f.horaCheckin || undefined,
      horaCheckout: f.horaCheckout || undefined,
      diasLaborales: f.diasLaborales.length ? f.diasLaborales : undefined,
      receptorAlertas: f.receptorAlertas.trim() || undefined,
      buenDiaTrabajo: f.buenDiaTrabajo.trim() || undefined,
      medicionPorRol: f.medicionPorRol.trim() || undefined,
      queCalificaBajo: f.queCalificaBajo.trim() || undefined,
      interesaCumplimiento: f.interesaCumplimiento.trim() || undefined,
      baseTalentoDelMes: f.baseTalentoDelMes.trim() || undefined,
      contactoNombre: f.contactoNombre.trim(),
      contactoCargo: f.contactoCargo.trim() || undefined,
      contactoCorreo: f.contactoCorreo.trim(),
      contactoTelefono: f.contactoTelefono.trim() || undefined,
    };
    try {
      await crearSolicitudImplementacion(datos);
      setEnviado(true);
    } catch (err) {
      setError(mensajeError(err, "No se pudo enviar el formulario. Intenta de nuevo."));
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
        <FondoMoltenMetal />
        <div className="relative z-10 max-w-md rounded-lg border border-white/10 bg-black/70 p-8 text-center shadow-elegant backdrop-blur-xl">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <h1 className="font-display mt-4 text-xl font-semibold text-foreground">¡Listo, recibimos tu información!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nuestro equipo va a revisar todo y te contacta en los próximos días para coordinar el arranque de tu
            plataforma TalentiX.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <FondoMoltenMetal />
      <div className="relative z-10 h-1.5 bg-gradient-to-r from-cyan-400 via-violet-600 to-fuchsia-500" />
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <BrandMark variant="onDark" />
        <h1 className="font-display mt-4 text-2xl font-bold text-white sm:text-3xl">
          Implementemos <span className="text-primary">TalentiX</span> en tu empresa
        </h1>
        <p className="mt-2 text-sm text-white/75">
          TalentiX se adapta a cómo tu empresa mide y organiza a su equipo. Completa lo que tengas a mano — lo demás
          lo resolvemos juntos en la reunión de arranque.
        </p>

        {/* Progreso */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-medium text-white/75">
            <span>
              Paso {paso + 1} de {PASOS.length}
            </span>
            <span>{PASOS[paso]}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-600 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="mt-8 space-y-4 rounded-lg border border-white/10 bg-black/70 p-5 shadow-elegant backdrop-blur-xl sm:p-6">
          {paso === 0 && (
            <>
              <div>
                <label className={LABEL}>Nombre de la empresa</label>
                <input value={f.empresaNombre} onChange={(e) => set("empresaNombre", e.target.value)} className={CAMPO} />
              </div>
              <div>
                <label className={LABEL}>¿A qué se dedican?</label>
                <input value={f.giroNegocio} onChange={(e) => set("giroNegocio", e.target.value)} className={CAMPO} />
              </div>
              <div>
                <label className={LABEL}>Cantidad total de empleados</label>
                <input
                  type="number"
                  min={1}
                  value={f.cantidadEmpleados}
                  onChange={(e) => set("cantidadEmpleados", e.target.value)}
                  className={CAMPO}
                />
              </div>
              <div>
                <label className={LABEL}>Logo de la empresa</label>
                <p className={HINT}>PNG, JPEG, WebP o SVG.</p>
                <SubidaArchivo
                  pathnamePrefix="onboarding/logo-"
                  aceptar="image/png,image/jpeg,image/webp,image/svg+xml"
                  cargando={subiendoLogo}
                  nombreArchivo={f.logoUrl ? "Logo subido ✓" : undefined}
                  onSubiendo={() => setSubiendoLogo(true)}
                  onListo={(url) => {
                    set("logoUrl", url);
                    setSubiendoLogo(false);
                  }}
                />
              </div>
            </>
          )}

          {paso === 1 && (
            <>
              <div>
                <label className={LABEL}>Departamentos</label>
                <p className={HINT}>Agrega uno por uno.</p>
                <DepartamentosInput valor={f.departamentos} onChange={(v) => set("departamentos", v)} />
              </div>
              <div>
                <label className={LABEL}>¿Algún colaborador pertenece a más de un departamento o rol a la vez?</label>
                <textarea
                  value={f.rolesMultiples}
                  onChange={(e) => set("rolesMultiples", e.target.value)}
                  rows={2}
                  className={CAMPO}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL}>¿Quién es el CEO / dueño de la cuenta?</label>
                  <input value={f.ceoNombre} onChange={(e) => set("ceoNombre", e.target.value)} className={CAMPO} />
                </div>
                <div>
                  <label className={LABEL}>¿Quién es RRHH?</label>
                  <input value={f.rrhhNombre} onChange={(e) => set("rrhhNombre", e.target.value)} className={CAMPO} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Encargados por departamento</label>
                <p className={HINT}>Nombre del encargado y a qué departamento pertenece — cada uno ve solo el suyo.</p>
                <EncargadosInput valor={f.encargados} onChange={(v) => set("encargados", v)} />
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Sube un Excel, CSV o PDF con tu equipo completo (nombre, rol, departamento, y lo demás que tengas). Si
                no lo tienes listo, no hay problema — lo completamos juntos en la reunión de arranque.
              </p>
              <SubidaArchivo
                pathnamePrefix="onboarding/roster-"
                aceptar=".pdf,.csv,.xls,.xlsx,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                cargando={subiendoRoster}
                nombreArchivo={f.rosterArchivoNombre || undefined}
                onSubiendo={() => setSubiendoRoster(true)}
                onListo={(url, nombre) => {
                  set("rosterArchivoUrl", url);
                  set("rosterArchivoNombre", nombre);
                  setSubiendoRoster(false);
                }}
              />
            </>
          )}

          {paso === 3 && (
            <div>
              <label className={LABEL}>¿Quieres usar el módulo de Vacantes con comparación de candidatos por IA?</label>
              <p className={HINT}>
                Publica vacantes y encuentra automáticamente qué talento interno encaja mejor, comparando su CV contra
                la descripción del puesto.
              </p>
              <div className="mt-2 flex gap-3">
                {(["si", "no"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("quiereVacantesIA", v)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium ${
                      f.quiereVacantesIA === v
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {v === "si" ? "Sí, lo quiero" : "No por ahora"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {paso === 4 && (
            <>
              <div>
                <label className={LABEL}>¿Cómo prefieren enviar sus bitácoras?</label>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                  {(
                    [
                      { v: "grupo", t: "Grupo de WhatsApp", d: "Todo el equipo junto" },
                      { v: "privado", t: "Privado", d: "Cada persona le escribe directo a TIX" },
                    ] as const
                  ).map((op) => (
                    <button
                      key={op.v}
                      type="button"
                      onClick={() => set("canalBitacoras", op.v)}
                      className={`flex-1 rounded-md border px-4 py-3 text-left text-sm ${
                        f.canalBitacoras === op.v
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-foreground">{op.t}</p>
                      <p className="text-xs text-muted-foreground">{op.d}</p>
                    </button>
                  ))}
                </div>
              </div>
              {f.canalBitacoras === "grupo" && (
                <div>
                  <label className={LABEL}>Nombre del grupo</label>
                  <input value={f.nombreGrupo} onChange={(e) => set("nombreGrupo", e.target.value)} className={CAMPO} />
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL}>Hora de check-in (mañana)</label>
                  <input type="time" value={f.horaCheckin} onChange={(e) => set("horaCheckin", e.target.value)} className={CAMPO} />
                </div>
                <div>
                  <label className={LABEL}>Hora de check-out (tarde)</label>
                  <input
                    type="time"
                    value={f.horaCheckout}
                    onChange={(e) => set("horaCheckout", e.target.value)}
                    className={CAMPO}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL}>Días laborales</label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        f.diasLaborales.includes(dia)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={LABEL}>¿Quién recibe las alertas y el reporte semanal?</label>
                <input
                  value={f.receptorAlertas}
                  onChange={(e) => set("receptorAlertas", e.target.value)}
                  className={CAMPO}
                />
              </div>
            </>
          )}

          {paso === 5 && (
            <>
              <p className="text-sm text-muted-foreground">
                Esta es la parte más importante: define cómo tu agente TIX va a calificar cada bitácora. No hay una
                respuesta &ldquo;correcta&rdquo; — queremos entender cómo <b>ustedes</b> ya miden a su equipo.
              </p>
              <div>
                <label className={LABEL}>¿Qué es &ldquo;un buen día de trabajo&rdquo; para ustedes?</label>
                <textarea value={f.buenDiaTrabajo} onChange={(e) => set("buenDiaTrabajo", e.target.value)} rows={3} className={CAMPO} />
              </div>
              <div>
                <label className={LABEL}>¿La forma de medir cambia según el rol o departamento? Descríbelo por grupo.</label>
                <textarea value={f.medicionPorRol} onChange={(e) => set("medicionPorRol", e.target.value)} rows={3} className={CAMPO} />
              </div>
              <div>
                <label className={LABEL}>¿Qué haría que un reporte se califique bajo?</label>
                <textarea value={f.queCalificaBajo} onChange={(e) => set("queCalificaBajo", e.target.value)} rows={2} className={CAMPO} />
              </div>
              <div>
                <label className={LABEL}>
                  ¿Les interesa medir &ldquo;cumplimiento&rdquo; (lo planificado en la mañana vs. lo ejecutado en la tarde)?
                </label>
                <textarea
                  value={f.interesaCumplimiento}
                  onChange={(e) => set("interesaCumplimiento", e.target.value)}
                  rows={2}
                  className={CAMPO}
                />
              </div>
              <div>
                <label className={LABEL}>¿En qué se basa el &ldquo;talento del mes/semana&rdquo; para ustedes?</label>
                <textarea
                  value={f.baseTalentoDelMes}
                  onChange={(e) => set("baseTalentoDelMes", e.target.value)}
                  rows={2}
                  className={CAMPO}
                />
              </div>
            </>
          )}

          {paso === 6 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL}>Nombre</label>
                  <input value={f.contactoNombre} onChange={(e) => set("contactoNombre", e.target.value)} className={CAMPO} />
                </div>
                <div>
                  <label className={LABEL}>Cargo</label>
                  <input value={f.contactoCargo} onChange={(e) => set("contactoCargo", e.target.value)} className={CAMPO} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL}>Correo</label>
                  <input
                    type="email"
                    value={f.contactoCorreo}
                    onChange={(e) => set("contactoCorreo", e.target.value)}
                    className={CAMPO}
                  />
                </div>
                <div>
                  <label className={LABEL}>Teléfono / WhatsApp</label>
                  <input
                    value={f.contactoTelefono}
                    onChange={(e) => set("contactoTelefono", e.target.value)}
                    className={CAMPO}
                  />
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={atras}
              disabled={paso === 0}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground disabled:opacity-0 hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> Atrás
            </button>
            {paso < PASOS.length - 1 ? (
              <button
                type="button"
                onClick={siguiente}
                className="flex items-center gap-1 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void enviar()}
                disabled={enviando}
                className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar formulario"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
