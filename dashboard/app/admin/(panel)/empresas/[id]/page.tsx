"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, ChevronLeft, Copy, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import {
  type EmpresaAdmin,
  type EmpleadoAdmin,
  type RolAdmin,
  AdminNoAutorizadoError,
  AdminConflictoError,
  fetchAdminDashboard,
  editarEmpresa,
  cambiarEstadoEmpresa,
  borrarEmpresaAdmin,
  fetchEmpleadosAdmin,
  crearEmpleadoAdmin,
  crearUsuarioAdmin,
  cambiarEstadoEmpleadoAdmin,
  borrarEmpleadoAdmin,
} from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { API_URL } from "@/lib/api";

const PLANES = ["starter", "pro", "enterprise"] as const;

const ROLES_LOGIN: { value: RolAdmin; label: string }[] = [
  { value: "CEO", label: "CEO" },
  { value: "RRHH", label: "RRHH" },
  { value: "MANAGER", label: "Gerente" },
  { value: "TALENTO", label: "Empleado" },
];

// ── Conectar Bot Modal ────────────────────────────────────────────────────────

function ModalConectarBot({
  empresa,
  onClose,
}: {
  empresa: EmpresaAdmin;
  onClose: () => void;
}) {
  const [copiado, setCopiado] = useState<string | null>(null);

  function copiar(texto: string, key: string) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(key);
      setTimeout(() => setCopiado(null), 2000);
    });
  }

  const apiUrl = API_URL.includes("localhost") ? "https://api.talentix.com.do" : API_URL;

  const toolsSnippet = `## Talentix API — Panel en Tiempo Real

### Configuración del endpoint
URL: ${apiUrl}/worklogs
Método: POST
Content-Type: application/json
empresaSlug (fijo para esta empresa): ${empresa.slug}
botToken (reservado para auth futura): ${empresa.botToken ?? "⚠️ sin token — regenera desde el panel"}

### Estructura del body (JSON)
{
  "empresaSlug": "${empresa.slug}",
  "talentoNombre": "Nombre completo del talento (exacto)",
  "fecha": "YYYY-MM-DD",
  "actividadesRealizadas": "Descripción detallada de actividades",
  "queSeEjecuto": "Resumen de lo ejecutado",
  "detallesRelevantes": "Detalles adicionales (opcional)",
  "informeAvances": "Informe de avances (opcional)",
  "objetivoDia": "Objetivo del día (opcional)",
  "estadoEnvio": "enviada",
  "horaEnvio": "HH:MM",
  "puntajeIA": 85,
  "semana": 1,
  "dia": "Lunes"
}

### Flujo de procesamiento
1. Recibir y procesar el mensaje completo del talento
2. Extraer todos los campos del JSON de arriba
3. Guardar registro en la hoja de Google Sheets
4. Hacer POST al endpoint con el JSON completo
5. Verificar respuesta exitosa (status 201)
6. Confirmar al talento con su puntaje y retroalimentación`;

  const botTokenTexto = empresa.botToken ?? "⚠️ sin token — regenera desde el panel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-popover shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">
                Conectar Bot — {empresa.nombre}
              </h2>
              <p className="text-xs text-muted-foreground">Instrucciones de integración con OpenClaw</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Datos clave */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Datos de la empresa
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Nombre", value: empresa.nombre },
                { label: "Slug", value: empresa.slug },
                { label: "ID", value: empresa.id },
                { label: "API endpoint", value: `${apiUrl}/worklogs` },
              ].map((d) => (
                <div key={d.label} className="rounded-md border border-border bg-background px-3 py-2">
                  <span className="text-muted-foreground">{d.label}: </span>
                  <span className="font-mono text-foreground break-all">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bot Token */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Bot Token (para autenticación futura)
              </p>
              <button
                onClick={() => copiar(botTokenTexto, "token")}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <Copy className="h-3 w-3" />
                {copiado === "token" ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="rounded-lg bg-zinc-950 px-4 py-3">
              <code className="font-mono text-xs text-emerald-400 break-all">{botTokenTexto}</code>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Guarda este token. Lo usarás cuando activemos la validación por empresa en el endpoint.
            </p>
          </div>

          {/* TOOLS.md snippet */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Bloque para TOOLS.md del bot
              </p>
              <button
                onClick={() => copiar(toolsSnippet, "tools")}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <Copy className="h-3 w-3" />
                {copiado === "tools" ? "¡Copiado!" : "Copiar todo"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-zinc-950 px-4 py-3 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
              {toolsSnippet}
            </pre>
          </div>

          {/* Pasos */}
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Pasos de configuración
            </p>
            <ol className="space-y-2">
              {[
                "Abre el archivo TOOLS.md de tu bot de OpenClaw para esta empresa.",
                "Pega el bloque de arriba al final del archivo.",
                "Guarda el archivo y reinicia el proceso del bot.",
                `Pide a un talento de ${empresa.nombre} que envíe una bitácora de prueba.`,
                "Verifica que aparece en el panel de la empresa dentro de los próximos segundos.",
              ].map((paso, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Eliminar Empresa Modal ────────────────────────────────────────────────────

function ModalEliminarEmpresa({
  empresa,
  onClose,
  onConfirm,
  eliminando,
  error,
}: {
  empresa: EmpresaAdmin;
  onClose: () => void;
  onConfirm: () => void;
  eliminando: boolean;
  error: string | null;
}) {
  const [confirmInput, setConfirmInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const confirmado = confirmInput === empresa.nombre;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-destructive/40 bg-popover p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              Eliminar empresa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta acción es <strong className="text-foreground">irreversible</strong>. Se borrarán
              todos los empleados y bitácoras de{" "}
              <strong className="text-foreground">{empresa.nombre}</strong>.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Escribe <span className="font-mono text-foreground">{empresa.nombre}</span> para confirmar:
          </label>
          <input
            ref={inputRef}
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={empresa.nombre}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
          />
        </div>

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={!confirmado || eliminando}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {eliminando ? "Eliminando..." : "Eliminar permanentemente"}
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminEmpresaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [empresa, setEmpresa] = useState<EmpresaAdmin | null>(null);
  const [empleados, setEmpleados] = useState<EmpleadoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [codigoVisible, setCodigoVisible] = useState(false);

  const [editForm, setEditForm] = useState({ nombre: "", plan: "", codigoAcceso: "" });
  const [guardandoEdit, setGuardandoEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editOk, setEditOk] = useState(false);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombreCompleto: "", rol: "" });
  const [guardandoEmpleado, setGuardandoEmpleado] = useState(false);
  const [empleadoError, setEmpleadoError] = useState<string | null>(null);
  const [mostrarFormEmpleado, setMostrarFormEmpleado] = useState(false);

  const [crearAcceso, setCrearAcceso] = useState(false);
  const [nuevoAcceso, setNuevoAcceso] = useState({ email: "", nombreLogin: "", rolLogin: "TALENTO" as RolAdmin, password: "" });
  const [resultadoAcceso, setResultadoAcceso] = useState<
    { tipo: "ok"; passwordTemporal: string | null } | { tipo: "error"; mensaje: string } | null
  >(null);
  const [passwordCopiada, setPasswordCopiada] = useState(false);

  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<string | null>(null);
  const [eliminandoEmpleadoId, setEliminandoEmpleadoId] = useState<string | null>(null);

  const [mostrarModalBot, setMostrarModalBot] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminandoEmpresa, setEliminandoEmpresa] = useState(false);
  const [eliminarEmpresaError, setEliminarEmpresaError] = useState<string | null>(null);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) { router.replace("/admin"); return; }

    Promise.all([fetchAdminDashboard(token), fetchEmpleadosAdmin(token, id)])
      .then(([dash, emps]) => {
        const emp = dash.empresas.find((e) => e.id === id) ?? null;
        setEmpresa(emp);
        if (emp) setEditForm({ nombre: emp.nombre, plan: emp.plan, codigoAcceso: emp.codigoAcceso ?? "" });
        setEmpleados(emps);
        setCargando(false);
      })
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) { borrarTokenAdmin(); router.replace("/admin"); }
        else setCargando(false);
      });
  }, [id, router]);

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token || !empresa) return;
    setEditError(null);
    setEditOk(false);
    setGuardandoEdit(true);
    try {
      const updated = await editarEmpresa(token, id, {
        nombre: editForm.nombre || undefined,
        plan: editForm.plan || undefined,
        codigoAcceso: editForm.codigoAcceso || undefined,
      });
      setEmpresa((prev) => prev ? { ...prev, ...updated } : prev);
      setEditOk(true);
    } catch (err) {
      if (err instanceof AdminConflictoError) setEditError(err.detail);
      else setEditError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardandoEdit(false);
    }
  }

  async function handleCrearEmpleado(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token) return;
    setEmpleadoError(null);
    setResultadoAcceso(null);
    setGuardandoEmpleado(true);
    try {
      const nuevo = await crearEmpleadoAdmin(token, id, nuevoEmpleado);
      setEmpleados((prev) => [...prev, { ...nuevo, _count: { worklogs: 0 } }]);
      setNuevoEmpleado({ nombreCompleto: "", rol: "" });

      if (crearAcceso) {
        try {
          const { passwordTemporal } = await crearUsuarioAdmin(token, id, {
            email: nuevoAcceso.email,
            nombre: nuevoAcceso.nombreLogin || nuevo.nombreCompleto,
            rol: nuevoAcceso.rolLogin,
            talentoId: nuevo.id,
            password: nuevoAcceso.password || undefined,
          });
          setResultadoAcceso({ tipo: "ok", passwordTemporal: nuevoAcceso.password ? null : passwordTemporal });
          setNuevoAcceso({ email: "", nombreLogin: "", rolLogin: "TALENTO", password: "" });
          setCrearAcceso(false);
        } catch (err) {
          setResultadoAcceso({
            tipo: "error",
            mensaje: `Empleado creado. No se pudo crear el acceso: ${err instanceof Error ? err.message : "error desconocido"}`,
          });
        }
      } else {
        setMostrarFormEmpleado(false);
      }
    } catch (err) {
      setEmpleadoError(err instanceof Error ? err.message : "Error al crear empleado");
    } finally {
      setGuardandoEmpleado(false);
    }
  }

  async function toggleEmpleado(talentoId: string, estadoActual: string) {
    const token = leerTokenAdmin();
    if (!token) return;
    setToggling(talentoId);
    try {
      const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
      const result = await cambiarEstadoEmpleadoAdmin(token, talentoId, nuevoEstado);
      setEmpleados((prev) => prev.map((e) => (e.id === talentoId ? { ...e, estado: result.estado } : e)));
    } finally {
      setToggling(null);
    }
  }

  async function handleEliminarEmpleado(talentoId: string) {
    const token = leerTokenAdmin();
    if (!token) return;
    setEliminandoEmpleadoId(talentoId);
    try {
      await borrarEmpleadoAdmin(token, talentoId);
      setEmpleados((prev) => prev.filter((e) => e.id !== talentoId));
      setConfirmandoEliminarId(null);
    } catch (err) {
      // show brief error in console; the button resets below
      console.error(err);
    } finally {
      setEliminandoEmpleadoId(null);
    }
  }

  async function handleEliminarEmpresa() {
    const token = leerTokenAdmin();
    if (!token) return;
    setEliminarEmpresaError(null);
    setEliminandoEmpresa(true);
    try {
      await borrarEmpresaAdmin(token, id);
      router.push("/admin/empresas");
    } catch (err) {
      setEliminarEmpresaError(err instanceof Error ? err.message : "Error al eliminar");
      setEliminandoEmpresa(false);
    }
  }

  if (cargando) return <LoadingScreen />;
  if (!empresa) return <p className="text-sm text-muted-foreground">Empresa no encontrada.</p>;

  return (
    <>
      <div className="max-w-3xl space-y-6">
        {/* Cabecera con acciones */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Volver
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setMostrarModalBot(true)}
              className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
            >
              <Bot className="h-3.5 w-3.5" /> Conectar Bot
            </button>
            <button
              onClick={() => setMostrarModalEliminar(true)}
              className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar empresa
            </button>
          </div>
        </div>

        {/* Datos de empresa */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display mb-4 text-base font-semibold text-foreground">Datos de la empresa</h2>
          <form onSubmit={(e) => void handleEdit(e)} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre</label>
                <input
                  value={editForm.nombre}
                  onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug (inmutable)</label>
                <input
                  value={empresa.slug}
                  disabled
                  className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm font-mono text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Plan</label>
                <select
                  value={editForm.plan}
                  onChange={(e) => setEditForm((f) => ({ ...f, plan: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {PLANES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Código de acceso</label>
                <div className="relative">
                  <input
                    type={codigoVisible ? "text" : "password"}
                    value={editForm.codigoAcceso}
                    onChange={(e) => setEditForm((f) => ({ ...f, codigoAcceso: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 pr-9 text-sm font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setCodigoVisible((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {codigoVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
            {editOk && <p className="text-sm text-success">Guardado correctamente.</p>}
            <button
              type="submit"
              disabled={guardandoEdit}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {guardandoEdit ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>

        {/* Empleados */}
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-base font-semibold text-foreground">
              Empleados ({empleados.length})
            </h2>
            <button
              onClick={() => setMostrarFormEmpleado((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar empleado
            </button>
          </div>

          {mostrarFormEmpleado && (
            <form
              onSubmit={(e) => void handleCrearEmpleado(e)}
              className="space-y-3 border-b border-border px-5 py-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre completo *</label>
                  <input
                    required
                    value={nuevoEmpleado.nombreCompleto}
                    onChange={(e) => setNuevoEmpleado((f) => ({ ...f, nombreCompleto: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Rol *</label>
                  <input
                    required
                    value={nuevoEmpleado.rol}
                    onChange={(e) => setNuevoEmpleado((f) => ({ ...f, rol: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={crearAcceso}
                  onChange={(e) => setCrearAcceso(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border"
                />
                Crear también su acceso de login
              </label>

              {crearAcceso && (
                <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-background/50 p-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Correo *</label>
                    <input
                      required={crearAcceso}
                      type="email"
                      value={nuevoAcceso.email}
                      onChange={(e) => setNuevoAcceso((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre de acceso</label>
                    <input
                      placeholder={nuevoEmpleado.nombreCompleto || "Igual al del empleado"}
                      value={nuevoAcceso.nombreLogin}
                      onChange={(e) => setNuevoAcceso((f) => ({ ...f, nombreLogin: e.target.value }))}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Rol de acceso</label>
                    <select
                      value={nuevoAcceso.rolLogin}
                      onChange={(e) => setNuevoAcceso((f) => ({ ...f, rolLogin: e.target.value as RolAdmin }))}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {ROLES_LOGIN.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Contraseña (vacío = temporal automática)
                    </label>
                    <input
                      type="text"
                      value={nuevoAcceso.password}
                      onChange={(e) => setNuevoAcceso((f) => ({ ...f, password: e.target.value }))}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              {empleadoError && <p className="text-sm text-destructive">{empleadoError}</p>}

              {resultadoAcceso?.tipo === "error" && <p className="text-sm text-destructive">{resultadoAcceso.mensaje}</p>}

              {resultadoAcceso?.tipo === "ok" && (
                <div className="rounded-md border border-success/30 bg-success/5 p-3">
                  <p className="text-sm text-success">Empleado y acceso creados correctamente.</p>
                  {resultadoAcceso.passwordTemporal && (
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-zinc-950 px-3 py-2">
                      <code className="font-mono text-xs text-emerald-400 break-all">
                        {resultadoAcceso.passwordTemporal}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(resultadoAcceso.passwordTemporal ?? "");
                          setPasswordCopiada(true);
                          setTimeout(() => setPasswordCopiada(false), 2000);
                        }}
                        className="flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        <Copy className="h-3 w-3" />
                        {passwordCopiada ? "¡Copiado!" : "Copiar"}
                      </button>
                    </div>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Contraseña temporal — guárdala ahora, no se vuelve a mostrar.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={guardandoEmpleado}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                >
                  {guardandoEmpleado ? "Agregando..." : "Agregar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormEmpleado(false);
                    setEmpleadoError(null);
                    setResultadoAcceso(null);
                    setCrearAcceso(false);
                  }}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  {resultadoAcceso ? "Cerrar" : "Cancelar"}
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-border">
            {empleados.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">Sin empleados registrados.</p>
            ) : (
              empleados.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between px-5 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{emp.nombreCompleto}</p>
                    <p className="text-xs text-muted-foreground">{emp.rol} · {emp._count.worklogs} bitácoras</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Toggle estado */}
                    <button
                      onClick={() => void toggleEmpleado(emp.id, emp.estado)}
                      disabled={toggling === emp.id}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${emp.estado === "activo" ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      {toggling === emp.id ? "..." : emp.estado === "activo" ? "Activo" : "Inactivo"}
                    </button>
                    {/* Ver ficha */}
                    <Link
                      href={`/admin/empresas/${id}/empleados/${emp.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Ver ficha
                    </Link>
                    {/* Eliminar con confirmación de dos clics */}
                    {confirmandoEliminarId === emp.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => void handleEliminarEmpleado(emp.id)}
                          disabled={eliminandoEmpleadoId === emp.id}
                          className="rounded px-2 py-0.5 text-xs font-semibold bg-destructive text-white disabled:opacity-50"
                        >
                          {eliminandoEmpleadoId === emp.id ? "..." : "Confirmar"}
                        </button>
                        <button
                          onClick={() => setConfirmandoEliminarId(null)}
                          className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmandoEliminarId(emp.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {mostrarModalBot && empresa && (
        <ModalConectarBot empresa={empresa} onClose={() => setMostrarModalBot(false)} />
      )}
      {mostrarModalEliminar && empresa && (
        <ModalEliminarEmpresa
          empresa={empresa}
          onClose={() => { setMostrarModalEliminar(false); setEliminarEmpresaError(null); }}
          onConfirm={() => void handleEliminarEmpresa()}
          eliminando={eliminandoEmpresa}
          error={eliminarEmpresaError}
        />
      )}
    </>
  );
}
