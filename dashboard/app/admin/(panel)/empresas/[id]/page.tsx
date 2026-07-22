"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { Bot, Building2, ChevronLeft, Copy, Eye, EyeOff, KeyRound, Link2, Mail, Plus, Trash2, UserCog, X } from "lucide-react";
import {
  type EmpresaAdmin,
  type EmpleadoAdmin,
  type RolAdmin,
  type UsuarioAdmin,
  type DepartamentoAdmin,
  type VinculoAdmin,
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
  fetchUsuariosAdmin,
  cambiarCorreoUsuarioAdmin,
  restablecerPasswordAdmin,
  cambiarRolUsuarioAdmin,
  fetchDepartamentosAdmin,
  crearDepartamentoAdmin,
  borrarDepartamentoAdmin,
  fetchVinculosAdmin,
  vincularUsuarioAdmin,
  desvincularUsuarioAdmin,
} from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { API_URL } from "@/lib/api";
import { mensajeError } from "@/lib/errores";

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
    <div className="pt-safe pb-safe fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-popover shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Bot className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <h2 className="font-display truncate text-base font-semibold text-foreground">
                Conectar Bot — {empresa.nombre}
              </h2>
              <p className="text-xs text-muted-foreground">Instrucciones de integración con OpenClaw</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 sm:px-6 sm:py-5">

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
        <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
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
    <div className="pt-safe pb-safe fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-destructive/40 bg-popover p-4 shadow-2xl sm:p-6">
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

// ── Logo de la empresa ──────────────────────────────────────────────────────

function LogoEmpresaAdmin({
  empresaId,
  logoUrl,
  onActualizado,
}: {
  empresaId: string;
  logoUrl: string | null | undefined;
  onActualizado: (logoUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    const token = leerTokenAdmin();
    if (!token) return;
    setError(null);
    setSubiendo(true);
    try {
      const blob = await upload(`empresas/${empresaId}/logo-${file.name}`, file, {
        access: "public",
        handleUploadUrl: `/api/admin/empresas/${empresaId}/logo`,
        headers: { "x-admin-token": token },
      });
      const actualizada = await editarEmpresa(token, empresaId, { logoUrl: blob.url });
      onActualizado(actualizada.logoUrl ?? blob.url);
    } catch (err) {
      setError(mensajeError(err, "No se pudo subir el logo. Intenta de nuevo."));
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display mb-4 text-base font-semibold text-foreground">Logo de la empresa</h2>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo de la empresa" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">Sin logo</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {subiendo ? "Subiendo..." : logoUrl ? "Cambiar logo" : "Subir logo"}
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
  const [nuevoAcceso, setNuevoAcceso] = useState({ email: "", nombreLogin: "", rolLogin: "TALENTO" as RolAdmin });
  const [resultadoAcceso, setResultadoAcceso] = useState<
    { tipo: "ok"; correo: string; sinTalento: boolean } | { tipo: "error"; mensaje: string } | null
  >(null);

  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<string | null>(null);
  const [eliminandoEmpleadoId, setEliminandoEmpleadoId] = useState<string | null>(null);

  const [mostrarModalBot, setMostrarModalBot] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminandoEmpresa, setEliminandoEmpresa] = useState(false);
  const [eliminarEmpresaError, setEliminarEmpresaError] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [editandoCorreoId, setEditandoCorreoId] = useState<string | null>(null);
  const [nuevoCorreoValor, setNuevoCorreoValor] = useState("");
  const [guardandoCorreoId, setGuardandoCorreoId] = useState<string | null>(null);
  const [correoError, setCorreoError] = useState<string | null>(null);
  const [enviandoResetId, setEnviandoResetId] = useState<string | null>(null);
  const [resetOkId, setResetOkId] = useState<string | null>(null);
  const [resetErrorId, setResetErrorId] = useState<string | null>(null);

  const [editandoRolId, setEditandoRolId] = useState<string | null>(null);
  const [nuevoRolValor, setNuevoRolValor] = useState<RolAdmin>("TALENTO");
  const [nuevoTalentoIdValor, setNuevoTalentoIdValor] = useState("");
  const [guardandoRolId, setGuardandoRolId] = useState<string | null>(null);
  const [rolError, setRolError] = useState<string | null>(null);

  const [departamentos, setDepartamentos] = useState<DepartamentoAdmin[]>([]);
  const [nuevoDepartamentoNombre, setNuevoDepartamentoNombre] = useState("");
  const [guardandoDepartamento, setGuardandoDepartamento] = useState(false);
  const [departamentoError, setDepartamentoError] = useState<string | null>(null);
  const [eliminandoDepartamentoId, setEliminandoDepartamentoId] = useState<string | null>(null);

  const [vinculos, setVinculos] = useState<VinculoAdmin[]>([]);
  const [nuevoVinculoEmail, setNuevoVinculoEmail] = useState("");
  const [guardandoVinculo, setGuardandoVinculo] = useState(false);
  const [vinculoError, setVinculoError] = useState<string | null>(null);
  const [desvinculandoId, setDesvinculandoId] = useState<string | null>(null);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) { router.replace("/admin"); return; }

    Promise.all([
      fetchAdminDashboard(token),
      fetchEmpleadosAdmin(token, id),
      fetchUsuariosAdmin(token, id),
      fetchDepartamentosAdmin(token, id),
      fetchVinculosAdmin(token, id),
    ])
      .then(([dash, emps, usrs, deptos, vincs]) => {
        const emp = dash.empresas.find((e) => e.id === id) ?? null;
        setEmpresa(emp);
        if (emp) setEditForm({ nombre: emp.nombre, plan: emp.plan, codigoAcceso: emp.codigoAcceso ?? "" });
        setEmpleados(emps);
        setUsuarios(usrs);
        setDepartamentos(deptos);
        setVinculos(vincs);
        setCargando(false);
      })
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) { borrarTokenAdmin(); router.replace("/admin"); }
        else setCargando(false);
      });
  }, [id, router]);

  async function handleVincular(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token || !nuevoVinculoEmail.trim()) return;
    setGuardandoVinculo(true);
    setVinculoError(null);
    try {
      await vincularUsuarioAdmin(token, id, nuevoVinculoEmail.trim());
      const actualizados = await fetchVinculosAdmin(token, id);
      setVinculos(actualizados);
      setNuevoVinculoEmail("");
    } catch (err) {
      setVinculoError(
        err instanceof AdminConflictoError ? err.detail : err instanceof Error ? err.message : "No se pudo vincular",
      );
    } finally {
      setGuardandoVinculo(false);
    }
  }

  async function handleDesvincular(usuarioId: string) {
    const token = leerTokenAdmin();
    if (!token) return;
    setDesvinculandoId(usuarioId);
    try {
      await desvincularUsuarioAdmin(token, id, usuarioId);
      setVinculos((prev) => prev.filter((v) => v.usuarioId !== usuarioId));
    } finally {
      setDesvinculandoId(null);
    }
  }

  async function handleCrearDepartamento(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token || !nuevoDepartamentoNombre.trim()) return;
    setGuardandoDepartamento(true);
    setDepartamentoError(null);
    try {
      const nuevo = await crearDepartamentoAdmin(token, id, nuevoDepartamentoNombre.trim());
      setDepartamentos((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNuevoDepartamentoNombre("");
    } catch (err) {
      setDepartamentoError(err instanceof Error ? err.message : "No se pudo crear el departamento");
    } finally {
      setGuardandoDepartamento(false);
    }
  }

  async function handleEliminarDepartamento(departamentoId: string) {
    const token = leerTokenAdmin();
    if (!token) return;
    setEliminandoDepartamentoId(departamentoId);
    try {
      await borrarDepartamentoAdmin(token, id, departamentoId);
      setDepartamentos((prev) => prev.filter((d) => d.id !== departamentoId));
    } catch (err) {
      setDepartamentoError(err instanceof Error ? err.message : "No se pudo eliminar el departamento");
    } finally {
      setEliminandoDepartamentoId(null);
    }
  }

  async function handleCambiarCorreo(usuarioId: string) {
    const token = leerTokenAdmin();
    if (!token || !nuevoCorreoValor.trim()) return;
    setGuardandoCorreoId(usuarioId);
    setCorreoError(null);
    try {
      const actualizado = await cambiarCorreoUsuarioAdmin(token, usuarioId, nuevoCorreoValor.trim());
      setUsuarios((prev) => prev.map((u) => (u.id === usuarioId ? { ...u, email: actualizado.email } : u)));
      setEditandoCorreoId(null);
      setNuevoCorreoValor("");
    } catch (err) {
      setCorreoError(err instanceof Error ? err.message : "No se pudo cambiar el correo");
    } finally {
      setGuardandoCorreoId(null);
    }
  }

  async function handleRestablecerPassword(usuarioId: string) {
    const token = leerTokenAdmin();
    if (!token) return;
    setEnviandoResetId(usuarioId);
    setResetOkId(null);
    setResetErrorId(null);
    try {
      await restablecerPasswordAdmin(token, usuarioId);
      setResetOkId(usuarioId);
    } catch {
      setResetErrorId(usuarioId);
    } finally {
      setEnviandoResetId(null);
    }
  }

  async function handleCambiarRol(usuarioId: string) {
    const token = leerTokenAdmin();
    if (!token) return;
    if (nuevoRolValor === "TALENTO" && !nuevoTalentoIdValor) {
      setRolError("Selecciona a qué empleado se vincula.");
      return;
    }
    setGuardandoRolId(usuarioId);
    setRolError(null);
    try {
      const actualizado = await cambiarRolUsuarioAdmin(
        token,
        usuarioId,
        nuevoRolValor,
        nuevoRolValor === "TALENTO" ? nuevoTalentoIdValor : undefined,
      );
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioId ? { ...u, rol: actualizado.rol, talentoId: actualizado.talentoId } : u)),
      );
      setEditandoRolId(null);
    } catch (err) {
      setRolError(err instanceof Error ? err.message : "No se pudo cambiar el rol");
    } finally {
      setGuardandoRolId(null);
    }
  }

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

  const esAccesoSinTalento = crearAcceso && (nuevoAcceso.rolLogin === "CEO" || nuevoAcceso.rolLogin === "RRHH");

  async function handleCrearEmpleado(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token) return;
    setEmpleadoError(null);
    setResultadoAcceso(null);
    setGuardandoEmpleado(true);
    try {
      // CEO/RRHH monitorean la plataforma, no son talento en seguimiento —
      // se les invita directo, sin crear un Talento para ellos.
      if (esAccesoSinTalento) {
        await crearUsuarioAdmin(token, id, {
          email: nuevoAcceso.email,
          nombre: nuevoAcceso.nombreLogin || nuevoEmpleado.nombreCompleto,
          rol: nuevoAcceso.rolLogin,
        });
        setResultadoAcceso({ tipo: "ok", correo: nuevoAcceso.email, sinTalento: true });
        setNuevoEmpleado({ nombreCompleto: "", rol: "" });
        setNuevoAcceso({ email: "", nombreLogin: "", rolLogin: "TALENTO" });
        setCrearAcceso(false);
        return;
      }

      const nuevo = await crearEmpleadoAdmin(token, id, nuevoEmpleado);
      setEmpleados((prev) => [...prev, { ...nuevo, _count: { worklogs: 0 } }]);
      setNuevoEmpleado({ nombreCompleto: "", rol: "" });

      if (crearAcceso) {
        try {
          await crearUsuarioAdmin(token, id, {
            email: nuevoAcceso.email,
            nombre: nuevoAcceso.nombreLogin || nuevo.nombreCompleto,
            rol: nuevoAcceso.rolLogin,
            talentoId: nuevo.id,
          });
          setResultadoAcceso({ tipo: "ok", correo: nuevoAcceso.email, sinTalento: false });
          setNuevoAcceso({ email: "", nombreLogin: "", rolLogin: "TALENTO" });
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

        <LogoEmpresaAdmin
          empresaId={empresa.id}
          logoUrl={empresa.logoUrl}
          onActualizado={(logoUrl) => setEmpresa((prev) => (prev ? { ...prev, logoUrl } : prev))}
        />

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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre completo *</label>
                  <input
                    required
                    value={nuevoEmpleado.nombreCompleto}
                    onChange={(e) => setNuevoEmpleado((f) => ({ ...f, nombreCompleto: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                {!esAccesoSinTalento && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Rol *</label>
                    <input
                      required={!esAccesoSinTalento}
                      value={nuevoEmpleado.rol}
                      onChange={(e) => setNuevoEmpleado((f) => ({ ...f, rol: e.target.value }))}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                )}
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
                <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-background/50 p-3 sm:grid-cols-2">
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
                  {esAccesoSinTalento && (
                    <p className="col-span-2 text-xs text-muted-foreground">
                      CEO/RRHH monitorean la plataforma — no se crea un talento en seguimiento para esta persona.
                    </p>
                  )}
                </div>
              )}

              {empleadoError && <p className="text-sm text-destructive">{empleadoError}</p>}

              {resultadoAcceso?.tipo === "error" && <p className="text-sm text-destructive">{resultadoAcceso.mensaje}</p>}

              {resultadoAcceso?.tipo === "ok" && (
                <div className="rounded-md border border-success/30 bg-success/5 p-3">
                  <p className="text-sm text-success">
                    {resultadoAcceso.sinTalento ? "Invitación enviada" : "Empleado creado. Invitación enviada"} a{" "}
                    {resultadoAcceso.correo}.
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Recibirá un correo para crear su propia contraseña y activar su cuenta.
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
                <div key={emp.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
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

        {/* Departamentos */}
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
              <Building2 className="h-4 w-4" /> Departamentos ({departamentos.length})
            </h2>
          </div>
          <p className="px-5 pt-4 text-xs text-muted-foreground">
            Una vez que agregues al menos uno, en el panel de esta empresa el campo &ldquo;Departamento&rdquo; (de
            empleados y gerentes) se vuelve una lista para elegir de aquí en vez de texto libre.
          </p>
          <form onSubmit={(e) => void handleCrearDepartamento(e)} className="flex items-end gap-2 px-5 py-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre</label>
              <input
                value={nuevoDepartamentoNombre}
                onChange={(e) => setNuevoDepartamentoNombre(e.target.value)}
                placeholder="Ej. Ventas"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={guardandoDepartamento || !nuevoDepartamentoNombre.trim()}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> {guardandoDepartamento ? "Agregando..." : "Agregar"}
            </button>
          </form>
          {departamentoError && <p className="px-5 pb-2 text-sm text-destructive">{departamentoError}</p>}
          <div className="divide-y divide-border">
            {departamentos.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">Sin departamentos configurados todavía.</p>
            ) : (
              departamentos.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <p className="text-sm text-foreground">{d.nombre}</p>
                  <button
                    onClick={() => void handleEliminarDepartamento(d.id)}
                    disabled={eliminandoDepartamentoId === d.id}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Eliminar departamento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Accesos de login */}
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-base font-semibold text-foreground">
              Accesos de login ({usuarios.length})
            </h2>
          </div>

          <div className="divide-y divide-border">
            {usuarios.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">Sin accesos creados.</p>
            ) : (
              usuarios.map((u) => (
                <div key={u.id} className="flex flex-col gap-2 px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{u.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email} · {u.rol}
                        {!u.passwordEstablecida && (
                          <span className="ml-1.5 rounded-full bg-warning/10 px-1.5 py-0.5 text-warning">
                            Pendiente de activar
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => {
                          setEditandoRolId(editandoRolId === u.id ? null : u.id);
                          setNuevoRolValor(u.rol);
                          setNuevoTalentoIdValor(u.talentoId ?? "");
                          setRolError(null);
                        }}
                        className="flex items-center gap-1 rounded p-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Cambiar rol"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditandoCorreoId(editandoCorreoId === u.id ? null : u.id);
                          setNuevoCorreoValor(u.email);
                          setCorreoError(null);
                        }}
                        className="flex items-center gap-1 rounded p-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Cambiar correo"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => void handleRestablecerPassword(u.id)}
                        disabled={enviandoResetId === u.id}
                        className="flex items-center gap-1 rounded p-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                        title="Enviar restablecimiento de contraseña"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {editandoRolId === u.id && (
                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background/50 p-2">
                      <select
                        value={nuevoRolValor}
                        onChange={(e) => setNuevoRolValor(e.target.value as RolAdmin)}
                        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {ROLES_LOGIN.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      {nuevoRolValor === "TALENTO" && (
                        <select
                          value={nuevoTalentoIdValor}
                          onChange={(e) => setNuevoTalentoIdValor(e.target.value)}
                          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Vincular a...</option>
                          {empleados
                            .filter((emp) => {
                              const usoActual = usuarios.find((us) => us.talentoId === emp.id);
                              return !usoActual || usoActual.id === u.id;
                            })
                            .map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.nombreCompleto}
                              </option>
                            ))}
                        </select>
                      )}
                      <button
                        onClick={() => void handleCambiarRol(u.id)}
                        disabled={guardandoRolId === u.id}
                        className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                      >
                        {guardandoRolId === u.id ? "..." : "Guardar"}
                      </button>
                      <button
                        onClick={() => { setEditandoRolId(null); setRolError(null); }}
                        className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  {editandoRolId === u.id && rolError && <p className="text-xs text-destructive">{rolError}</p>}

                  {editandoCorreoId === u.id && (
                    <div className="flex items-center gap-2 rounded-md border border-border bg-background/50 p-2">
                      <input
                        type="email"
                        value={nuevoCorreoValor}
                        onChange={(e) => setNuevoCorreoValor(e.target.value)}
                        className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button
                        onClick={() => void handleCambiarCorreo(u.id)}
                        disabled={guardandoCorreoId === u.id}
                        className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                      >
                        {guardandoCorreoId === u.id ? "..." : "Guardar"}
                      </button>
                      <button
                        onClick={() => { setEditandoCorreoId(null); setCorreoError(null); }}
                        className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  {editandoCorreoId === u.id && correoError && (
                    <p className="text-xs text-destructive">{correoError}</p>
                  )}
                  {resetOkId === u.id && (
                    <p className="text-xs text-success">Correo de restablecimiento enviado.</p>
                  )}
                  {resetErrorId === u.id && (
                    <p className="text-xs text-destructive">No se pudo enviar el restablecimiento.</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sucursales: accesos vinculados */}
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
              <Link2 className="h-4 w-4" /> Sucursales — accesos vinculados ({vinculos.length})
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Da a un CEO o RRHH de otra empresa acceso a esta también — le aparecerá un selector para cambiar entre
              ambas desde su panel, sin crear un login nuevo.
            </p>
          </div>

          <form onSubmit={(e) => void handleVincular(e)} className="flex items-end gap-2 border-b border-border px-5 py-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Correo del usuario CEO/RRHH (de cualquier empresa)
              </label>
              <input
                type="email"
                value={nuevoVinculoEmail}
                onChange={(e) => setNuevoVinculoEmail(e.target.value)}
                placeholder="ceo@otraempresa.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={guardandoVinculo || !nuevoVinculoEmail.trim()}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> {guardandoVinculo ? "Vinculando..." : "Vincular"}
            </button>
          </form>
          {vinculoError && <p className="px-5 pb-2 text-sm text-destructive">{vinculoError}</p>}

          <div className="divide-y divide-border">
            {vinculos.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">Sin accesos vinculados todavía.</p>
            ) : (
              vinculos.map((v) => (
                <div key={v.usuarioId} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{v.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {v.email} · {v.rol} · empresa casa: {v.empresaCasa}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleDesvincular(v.usuarioId)}
                    disabled={desvinculandoId === v.usuarioId}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Quitar acceso vinculado"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
