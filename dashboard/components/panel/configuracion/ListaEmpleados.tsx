"use client";

import { Fragment, useEffect, useState } from "react";
import { KeyRound, Mail, Plus, Users } from "lucide-react";
import {
  type DatosNuevoTalento,
  type EmpleadoResumen,
  type RolInvitable,
  type UsuarioTalento,
  crearTalento,
  crearUsuarioTalento,
  fetchEmpleados,
  fetchUsuariosTalento,
  cambiarCorreoUsuarioTalento,
  restablecerPasswordUsuarioTalento,
} from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { StaggerGroup, StaggerItem, StaggerRow, StaggerTableBody } from "@/components/motion/Stagger";
import { SkeletonTableRows } from "@/components/motion/Skeleton";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

const ROLES_INVITABLES: { value: RolInvitable; label: string }[] = [
  { value: "TALENTO", label: "Empleado" },
  { value: "MANAGER", label: "Gerente" },
];

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; empleados: EmpleadoResumen[] };

function formularioVacio(): DatosNuevoTalento {
  return {
    nombreCompleto: "",
    rol: "",
    apellido: "",
    departamento: "",
    cedula: "",
    correo: "",
    telefono: "",
    fechaIngreso: "",
  };
}

/** Quita las cadenas vacías antes de mandar al backend — un campo vacío no es lo mismo que "bórralo". */
function limpiarOpcionales(datos: DatosNuevoTalento): DatosNuevoTalento {
  const limpio: DatosNuevoTalento = { nombreCompleto: datos.nombreCompleto.trim(), rol: datos.rol.trim() };
  if (datos.apellido?.trim()) limpio.apellido = datos.apellido.trim();
  if (datos.departamento?.trim()) limpio.departamento = datos.departamento.trim();
  if (datos.cedula?.trim()) limpio.cedula = datos.cedula.trim();
  if (datos.correo?.trim()) limpio.correo = datos.correo.trim();
  if (datos.telefono?.trim()) limpio.telefono = datos.telefono.trim();
  if (datos.fechaIngreso?.trim()) limpio.fechaIngreso = datos.fechaIngreso.trim();
  return limpio;
}

export function ListaEmpleados({ slug }: { slug: string }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<DatosNuevoTalento>(formularioVacio);
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [crearAcceso, setCrearAcceso] = useState(false);
  const [nuevoAcceso, setNuevoAcceso] = useState({ email: "", nombreLogin: "", rolLogin: "TALENTO" as RolInvitable });
  const [resultadoAcceso, setResultadoAcceso] = useState<
    { tipo: "ok"; correo: string } | { tipo: "error"; mensaje: string } | null
  >(null);

  const [usuarios, setUsuarios] = useState<UsuarioTalento[]>([]);
  const [editandoCorreoId, setEditandoCorreoId] = useState<string | null>(null);
  const [nuevoCorreoValor, setNuevoCorreoValor] = useState("");
  const [guardandoCorreoId, setGuardandoCorreoId] = useState<string | null>(null);
  const [correoError, setCorreoError] = useState<string | null>(null);
  const [enviandoResetId, setEnviandoResetId] = useState<string | null>(null);
  const [resetOkId, setResetOkId] = useState<string | null>(null);
  const [resetErrorId, setResetErrorId] = useState<string | null>(null);

  const [invitandoTalentoId, setInvitandoTalentoId] = useState<string | null>(null);
  const [formAcceso, setFormAcceso] = useState({ email: "", nombreLogin: "", rolLogin: "TALENTO" as RolInvitable });
  const [guardandoAccesoId, setGuardandoAccesoId] = useState<string | null>(null);
  const [accesoExistenteError, setAccesoExistenteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchEmpleados(slug)
      .then((empleados) => {
        if (!cancelado) setEstado({ tipo: "listo", empleados });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    fetchUsuariosTalento(slug)
      .then((usrs) => {
        if (!cancelado) setUsuarios(usrs);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [slug]);

  function campo<K extends keyof DatosNuevoTalento>(clave: K, valor: DatosNuevoTalento[K]) {
    setForm((prev) => ({ ...prev, [clave]: valor }));
  }

  async function handleCambiarCorreo(usuarioId: string) {
    if (!nuevoCorreoValor.trim()) return;
    setGuardandoCorreoId(usuarioId);
    setCorreoError(null);
    try {
      const actualizado = await cambiarCorreoUsuarioTalento(slug, usuarioId, nuevoCorreoValor.trim());
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
    setEnviandoResetId(usuarioId);
    setResetOkId(null);
    setResetErrorId(null);
    try {
      await restablecerPasswordUsuarioTalento(slug, usuarioId);
      setResetOkId(usuarioId);
    } catch {
      setResetErrorId(usuarioId);
    } finally {
      setEnviandoResetId(null);
    }
  }

  async function handleDarAcceso(talentoId: string, nombreTalento: string) {
    if (!formAcceso.email.trim()) return;
    setGuardandoAccesoId(talentoId);
    setAccesoExistenteError(null);
    try {
      const { usuario } = await crearUsuarioTalento(slug, {
        email: formAcceso.email,
        nombre: formAcceso.nombreLogin || nombreTalento,
        rol: formAcceso.rolLogin,
        talentoId,
      });
      setUsuarios((prev) => [
        ...prev,
        { ...usuario, activo: true, passwordEstablecida: false, talentoId },
      ]);
      setInvitandoTalentoId(null);
      setFormAcceso({ email: "", nombreLogin: "", rolLogin: "TALENTO" });
    } catch (err) {
      setAccesoExistenteError(err instanceof Error ? err.message : "No se pudo enviar la invitación");
    } finally {
      setGuardandoAccesoId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombreCompleto.trim() || !form.rol.trim()) return;
    setEnviando(true);
    setErrorForm(null);
    setResultadoAcceso(null);
    try {
      const nuevo = await crearTalento(slug, limpiarOpcionales(form));
      setEstado((prev) =>
        prev.tipo === "listo" ? { tipo: "listo", empleados: [...prev.empleados, nuevo] } : prev,
      );
      setForm(formularioVacio());

      if (crearAcceso) {
        try {
          const { usuario } = await crearUsuarioTalento(slug, {
            email: nuevoAcceso.email,
            nombre: nuevoAcceso.nombreLogin || nuevo.nombreCompleto,
            rol: nuevoAcceso.rolLogin,
            talentoId: nuevo.id,
          });
          setUsuarios((prev) => [
            ...prev,
            { ...usuario, activo: true, passwordEstablecida: false, talentoId: nuevo.id },
          ]);
          setResultadoAcceso({ tipo: "ok", correo: nuevoAcceso.email });
          setNuevoAcceso({ email: "", nombreLogin: "", rolLogin: "TALENTO" });
          setCrearAcceso(false);
        } catch (err) {
          setResultadoAcceso({
            tipo: "error",
            mensaje: `Empleado creado. No se pudo crear el acceso: ${err instanceof Error ? err.message : "error desconocido"}`,
          });
        }
      } else {
        setMostrarForm(false);
      }
    } catch {
      setErrorForm("No se pudo agregar el empleado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Users className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Empleados registrados
          </p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar empleado
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="space-y-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Nombre completo
              </label>
              <input
                value={form.nombreCompleto}
                onChange={(e) => campo("nombreCompleto", e.target.value)}
                className={CAMPO_CLASES}
                placeholder="Nombre y apellido"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Apellido</label>
              <input
                value={form.apellido}
                onChange={(e) => campo("apellido", e.target.value)}
                className={CAMPO_CLASES}
                placeholder="Opcional"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Rol</label>
              <input
                value={form.rol}
                onChange={(e) => campo("rol", e.target.value)}
                className={CAMPO_CLASES}
                placeholder="Cargo o rol"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Departamento
              </label>
              <input
                value={form.departamento}
                onChange={(e) => campo("departamento", e.target.value)}
                className={CAMPO_CLASES}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cédula</label>
              <input
                value={form.cedula}
                onChange={(e) => campo("cedula", e.target.value)}
                className={CAMPO_CLASES}
                placeholder="Opcional"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Correo</label>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => campo("correo", e.target.value)}
                className={CAMPO_CLASES}
                placeholder="Opcional"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Teléfono</label>
              <input
                value={form.telefono}
                onChange={(e) => campo("telefono", e.target.value)}
                className={CAMPO_CLASES}
                placeholder="Opcional"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Fecha de ingreso
              </label>
              <input
                type="date"
                value={form.fechaIngreso}
                onChange={(e) => campo("fechaIngreso", e.target.value)}
                className={CAMPO_CLASES}
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
            <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-background/50 p-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Correo *</label>
                <input
                  required={crearAcceso}
                  type="email"
                  value={nuevoAcceso.email}
                  onChange={(e) => setNuevoAcceso((f) => ({ ...f, email: e.target.value }))}
                  className={CAMPO_CLASES}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Nombre de acceso
                </label>
                <input
                  placeholder={form.nombreCompleto || "Igual al del empleado"}
                  value={nuevoAcceso.nombreLogin}
                  onChange={(e) => setNuevoAcceso((f) => ({ ...f, nombreLogin: e.target.value }))}
                  className={CAMPO_CLASES}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Rol de acceso
                </label>
                <select
                  value={nuevoAcceso.rolLogin}
                  onChange={(e) => setNuevoAcceso((f) => ({ ...f, rolLogin: e.target.value as RolInvitable }))}
                  className={CAMPO_CLASES}
                >
                  {ROLES_INVITABLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {resultadoAcceso?.tipo === "error" && <p className="text-xs text-destructive">{resultadoAcceso.mensaje}</p>}

          {resultadoAcceso?.tipo === "ok" && (
            <div className="rounded-md border border-success/30 bg-success/5 p-3">
              <p className="text-sm text-success">Empleado creado. Invitación enviada a {resultadoAcceso.correo}.</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Recibirá un correo para crear su propia contraseña y activar su cuenta.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Guardando..." : "Guardar"}
            </button>
            {resultadoAcceso && (
              <button
                type="button"
                onClick={() => {
                  setMostrarForm(false);
                  setResultadoAcceso(null);
                  setCrearAcceso(false);
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Cerrar
              </button>
            )}
            {errorForm && <p className="text-xs text-destructive">{errorForm}</p>}
          </div>
        </form>
      )}

      {/* Escritorio/tablet ancha: tabla */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Departamento</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acceso</th>
            </tr>
          </thead>
          <tbody>
            {estado.tipo === "cargando" && <SkeletonTableRows rows={4} cols={5} />}
            {estado.tipo === "error" && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-destructive">
                  No se pudo cargar el listado de empleados.
                </td>
              </tr>
            )}
          </tbody>
          {estado.tipo === "listo" && (
            <StaggerTableBody>
              {estado.empleados.map((e) => {
                const acceso = usuarios.find((u) => u.talentoId === e.id);
                return (
                  <Fragment key={e.id}>
                    <StaggerRow className="border-t border-border transition-colors hover:bg-muted/50">
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <Avatar nombreCompleto={e.nombreCompleto} fotoUrl={e.fotoUrl} size="sm" />
                          {e.nombreCompleto}
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-2.5 text-muted-foreground" title={e.rol}>
                        {e.rol}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-2.5 text-muted-foreground">
                        {e.departamento ?? "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            e.estado === "activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {e.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {acceso ? (
                          <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            {acceso.passwordEstablecida ? "Con acceso" : "Invitado"}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setInvitandoTalentoId(invitandoTalentoId === e.id ? null : e.id);
                              setFormAcceso({ email: "", nombreLogin: "", rolLogin: "TALENTO" });
                              setAccesoExistenteError(null);
                            }}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Dar acceso
                          </button>
                        )}
                      </td>
                    </StaggerRow>
                    {invitandoTalentoId === e.id && (
                      <tr className="border-t border-border bg-muted/30">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="flex flex-wrap items-end gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Correo *
                              </label>
                              <input
                                type="email"
                                value={formAcceso.email}
                                onChange={(ev) => setFormAcceso((f) => ({ ...f, email: ev.target.value }))}
                                className={CAMPO_CLASES}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Nombre de acceso
                              </label>
                              <input
                                placeholder={e.nombreCompleto}
                                value={formAcceso.nombreLogin}
                                onChange={(ev) => setFormAcceso((f) => ({ ...f, nombreLogin: ev.target.value }))}
                                className={CAMPO_CLASES}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Rol de acceso
                              </label>
                              <select
                                value={formAcceso.rolLogin}
                                onChange={(ev) =>
                                  setFormAcceso((f) => ({ ...f, rolLogin: ev.target.value as RolInvitable }))
                                }
                                className={CAMPO_CLASES}
                              >
                                {ROLES_INVITABLES.map((r) => (
                                  <option key={r.value} value={r.value}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => void handleDarAcceso(e.id, e.nombreCompleto)}
                              disabled={guardandoAccesoId === e.id}
                              className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                            >
                              {guardandoAccesoId === e.id ? "Enviando..." : "Invitar"}
                            </button>
                            <button
                              onClick={() => setInvitandoTalentoId(null)}
                              className="rounded-md border border-border px-3 py-2 text-xs hover:bg-accent"
                            >
                              Cancelar
                            </button>
                          </div>
                          {accesoExistenteError && (
                            <p className="mt-2 text-xs text-destructive">{accesoExistenteError}</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </StaggerTableBody>
          )}
        </table>
      </div>

      {/* Celular/tablet vertical: tarjetas apiladas */}
      <div className="divide-y divide-border lg:hidden">
        {estado.tipo === "cargando" && (
          <div className="space-y-3 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-20 rounded-lg" />
            ))}
          </div>
        )}
        {estado.tipo === "error" && (
          <p className="px-4 py-8 text-center text-sm text-destructive">No se pudo cargar el listado de empleados.</p>
        )}
        {estado.tipo === "listo" && (
          <StaggerGroup>
            {estado.empleados.map((e) => {
              const acceso = usuarios.find((u) => u.talentoId === e.id);
              return (
                <StaggerItem key={e.id}>
                  <div className="flex flex-col gap-2 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar nombreCompleto={e.nombreCompleto} fotoUrl={e.fotoUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{e.nombreCompleto}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {e.rol}
                          {e.departamento ? ` · ${e.departamento}` : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                          e.estado === "activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {e.estado === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div>
                      {acceso ? (
                        <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          {acceso.passwordEstablecida ? "Con acceso" : "Invitado"}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setInvitandoTalentoId(invitandoTalentoId === e.id ? null : e.id);
                            setFormAcceso({ email: "", nombreLogin: "", rolLogin: "TALENTO" });
                            setAccesoExistenteError(null);
                          }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Dar acceso
                        </button>
                      )}
                    </div>

                    {invitandoTalentoId === e.id && (
                      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Correo *
                          </label>
                          <input
                            type="email"
                            value={formAcceso.email}
                            onChange={(ev) => setFormAcceso((f) => ({ ...f, email: ev.target.value }))}
                            className={CAMPO_CLASES}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Nombre de acceso
                          </label>
                          <input
                            placeholder={e.nombreCompleto}
                            value={formAcceso.nombreLogin}
                            onChange={(ev) => setFormAcceso((f) => ({ ...f, nombreLogin: ev.target.value }))}
                            className={CAMPO_CLASES}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Rol de acceso
                          </label>
                          <select
                            value={formAcceso.rolLogin}
                            onChange={(ev) => setFormAcceso((f) => ({ ...f, rolLogin: ev.target.value as RolInvitable }))}
                            className={CAMPO_CLASES}
                          >
                            {ROLES_INVITABLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => void handleDarAcceso(e.id, e.nombreCompleto)}
                            disabled={guardandoAccesoId === e.id}
                            className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                          >
                            {guardandoAccesoId === e.id ? "Enviando..." : "Invitar"}
                          </button>
                          <button
                            onClick={() => setInvitandoTalentoId(null)}
                            className="rounded-md border border-border px-3 py-2 text-xs hover:bg-accent"
                          >
                            Cancelar
                          </button>
                        </div>
                        {accesoExistenteError && <p className="text-xs text-destructive">{accesoExistenteError}</p>}
                      </div>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>

      {usuarios.length > 0 && (
        <div className="border-t border-border">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Accesos de login ({usuarios.length})
            </p>
          </div>
          <div className="divide-y divide-border">
            {usuarios.map((u) => (
              <div key={u.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{u.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email} · {u.rol === "MANAGER" ? "Gerente" : "Empleado"}
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
                {resetOkId === u.id && <p className="text-xs text-success">Correo de restablecimiento enviado.</p>}
                {resetErrorId === u.id && (
                  <p className="text-xs text-destructive">No se pudo enviar el restablecimiento.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
