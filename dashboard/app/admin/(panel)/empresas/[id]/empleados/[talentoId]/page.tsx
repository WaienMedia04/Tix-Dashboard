"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ClipboardList, Sparkles, TrendingUp } from "lucide-react";
import {
  type FichaTalentoAdmin,
  AdminNoAutorizadoError,
  fichaEmpleadoAdmin,
  editarEmpleadoAdmin,
  cambiarEstadoEmpleadoAdmin,
} from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

function BadgeEstado({ estado }: { estado: string }) {
  if (estado === "enviada")
    return <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">✓ enviada</span>;
  if (estado === "no enviada")
    return <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">✗ no enviada</span>;
  if (estado === "permiso")
    return <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs font-semibold text-info">📋 permiso</span>;
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground capitalize">
      {estado}
    </span>
  );
}

export default function AdminFichaEmpleadoPage() {
  const { id: empresaId, talentoId } = useParams<{ id: string; talentoId: string }>();
  const router = useRouter();

  const [ficha, setFicha] = useState<FichaTalentoAdmin | null>(null);
  const [cargando, setCargando] = useState(true);

  // Form state
  const [form, setForm] = useState({
    nombreCompleto: "",
    rol: "",
    cedula: "",
    correo: "",
    telefono: "",
    fechaIngreso: "",
    fechaNacimiento: "",
    direccion: "",
    notas: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [guardadoError, setGuardadoError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) { router.replace("/admin"); return; }

    fichaEmpleadoAdmin(token, talentoId)
      .then((data) => {
        setFicha(data);
        setForm({
          nombreCompleto: data.nombreCompleto,
          rol: data.rol,
          cedula: data.cedula ?? "",
          correo: data.correo ?? "",
          telefono: data.telefono ?? "",
          fechaIngreso: toDateInput(data.fechaIngreso),
          fechaNacimiento: toDateInput(data.fechaNacimiento),
          direccion: data.direccion ?? "",
          notas: data.notas ?? "",
        });
        setCargando(false);
      })
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) { borrarTokenAdmin(); router.replace("/admin"); }
        else setCargando(false);
      });
  }, [talentoId, router]);

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token || !ficha) return;
    setGuardadoError(null);
    setGuardadoOk(false);
    setGuardando(true);
    try {
      const updated = await editarEmpleadoAdmin(token, talentoId, {
        nombreCompleto: form.nombreCompleto || undefined,
        rol: form.rol || undefined,
        cedula: form.cedula || null,
        correo: form.correo || null,
        telefono: form.telefono || null,
        fechaIngreso: form.fechaIngreso || null,
        fechaNacimiento: form.fechaNacimiento || null,
        direccion: form.direccion || null,
        notas: form.notas || null,
      });
      setFicha((prev) => prev ? { ...prev, ...updated } : prev);
      setGuardadoOk(true);
    } catch (err) {
      setGuardadoError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  async function toggleEstado() {
    const token = leerTokenAdmin();
    if (!token || !ficha) return;
    setToggling(true);
    try {
      const nuevoEstado = ficha.estado === "activo" ? "inactivo" : "activo";
      const result = await cambiarEstadoEmpleadoAdmin(token, talentoId, nuevoEstado);
      setFicha((prev) => prev ? { ...prev, estado: result.estado } : prev);
    } finally {
      setToggling(false);
    }
  }

  if (cargando) return <LoadingScreen />;
  if (!ficha) return <p className="text-sm text-muted-foreground">Empleado no encontrado.</p>;

  const { metricas, worklogs } = ficha;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Volver */}
      <button
        onClick={() => router.push(`/admin/empresas/${empresaId}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver a la empresa
      </button>

      {/* Header: avatar + datos + estado */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {iniciales(ficha.nombreCompleto)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-semibold text-foreground">
            {ficha.nombreCompleto}
          </p>
          <p className="text-sm text-muted-foreground">{ficha.rol}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ficha.empresa.nombre}{" "}
            <span className="font-mono text-muted-foreground/70">· {ficha.empresa.slug}</span>
          </p>
        </div>
        <button
          onClick={() => void toggleEstado()}
          disabled={toggling}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors disabled:opacity-50 ${ficha.estado === "activo" ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >
          {toggling ? "..." : ficha.estado === "activo" ? "Activo" : "Inactivo"}
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Bitácoras", value: metricas.totalBitacoras, icon: ClipboardList },
          {
            label: "Puntaje promedio IA",
            value: metricas.puntajePromedio != null ? `${metricas.puntajePromedio}` : "—",
            icon: Sparkles,
          },
          { label: "Cumplimiento", value: `${metricas.cumplimiento}%`, icon: TrendingUp },
        ].map((m) => (
          <div key={m.label} className="select-none rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <m.icon className="h-4 w-4 text-primary/70" />
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{m.label}</p>
            </div>
            <p className="font-display mt-2 text-2xl font-semibold tabular-nums text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Expediente */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display mb-5 text-base font-semibold text-foreground">Expediente</h2>
        <form onSubmit={(e) => void handleGuardar(e)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre completo</label>
              <input
                value={form.nombreCompleto}
                onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Rol</label>
              <input
                value={form.rol}
                onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Cédula</label>
              <input
                value={form.cedula}
                onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value }))}
                placeholder="—"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Correo</label>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
                placeholder="—"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Teléfono</label>
              <input
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                placeholder="—"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              {/* spacer */}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha de ingreso</label>
              <input
                type="date"
                value={form.fechaIngreso}
                onChange={(e) => setForm((f) => ({ ...f, fechaIngreso: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha de nacimiento</label>
              <input
                type="date"
                value={form.fechaNacimiento}
                onChange={(e) => setForm((f) => ({ ...f, fechaNacimiento: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Dirección</label>
              <input
                value={form.direccion}
                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                placeholder="—"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Notas internas</label>
              <textarea
                value={form.notas}
                onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                placeholder="—"
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {guardadoError && <p className="text-sm text-destructive">{guardadoError}</p>}
          {guardadoOk && <p className="text-sm text-success">Guardado correctamente.</p>}

          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar expediente"}
          </button>
        </form>
      </div>

      {/* Historial de bitácoras */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Historial de bitácoras
            {metricas.totalBitacoras > 50 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (últimas 50 de {metricas.totalBitacoras})
              </span>
            )}
          </h2>
        </div>

        {worklogs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">Sin bitácoras registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-3 py-3">Día</th>
                  <th className="px-3 py-3 text-center">Sem.</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3 text-center">Pts. IA</th>
                  <th className="px-3 py-3">Actividades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {worklogs.map((w) => (
                  <tr key={w.id} className="hover:bg-accent/40">
                    <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {formatFecha(w.fecha)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{w.dia ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted-foreground tabular-nums">
                      {w.semana ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <BadgeEstado estado={w.estadoEnvio} />
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-xs tabular-nums text-foreground">
                      {w.puntajeIA ?? "—"}
                    </td>
                    <td className="max-w-xs px-3 py-2.5 text-xs text-muted-foreground">
                      <span className="line-clamp-1">{w.actividadesRealizadas ?? "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
